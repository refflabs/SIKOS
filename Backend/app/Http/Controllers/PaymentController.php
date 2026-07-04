<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Http\Controllers\BookingController;
use App\Services\RealtimeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    // GET /api/admin/payments/summary
    public function summary()
    {
        // 1. Total Revenue (Accepted bookings)
        $totalRevenue = Booking::whereIn('status', ['accepted', 'confirmed'])
            ->sum('total_price');

        // 2. Pending Verification (Pending bookings with payment receipt)
        $pendingAmount = Booking::where('status', 'pending')
            ->whereNotNull('payment_receipt')
            ->sum('total_price');

        $pendingCount = Booking::where('status', 'pending')
            ->whereNotNull('payment_receipt')
            ->count();

        // 3. Outstanding (Pending bookings without payment receipt)
        $outstandingAmount = Booking::where('status', 'pending')
            ->whereNull('payment_receipt')
            ->sum('total_price');

        // 4. Monthly Income statistics (grouped by check_in month)
        // PostgreSQL compatibility
        $monthlyStats = Booking::whereIn('status', ['accepted', 'confirmed'])
            ->select(
                DB::raw("TO_CHAR(check_in, 'YYYY-MM') as month"),
                DB::raw("SUM(total_price) as total")
            )
            ->groupBy(DB::raw("TO_CHAR(check_in, 'YYYY-MM')"))
            ->orderBy('month', 'asc')
            ->get();

        // 5. Room Occupancy
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('stock', 0)->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;

        return response()->json([
            'total_revenue' => (float)$totalRevenue,
            'pending_amount' => (float)$pendingAmount,
            'pending_count' => $pendingCount,
            'outstanding_amount' => (float)$outstandingAmount,
            'occupancy_rate' => $occupancyRate,
            'monthly_stats' => $monthlyStats,
        ]);
    }

    // GET /api/admin/payments
    public function index(Request $request)
    {
        $query = Booking::select('id', 'user_id', 'room_id', 'check_in', 'check_out', 'duration_months', 'total_price', 'status', 'notes', 'created_at', 'updated_at', 'renewal_requested', 'renewal_months')
            ->selectRaw('CASE WHEN payment_receipt IS NOT NULL AND payment_receipt != \'\' THEN 1 ELSE 0 END as has_payment_receipt')
            ->with(['user', 'room']);

        // Search by User Name or Booking ID
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'ilike', '%' . $search . '%');
                })->orWhere('id', 'like', '%' . $search . '%');
            });
        }

        // Filter by Status
        if ($request->filled('status')) {
            if ($request->status === 'pending_receipt') {
                $query->where('status', 'pending')->whereNotNull('payment_receipt');
            } elseif ($request->status === 'unpaid') {
                $query->where('status', 'pending')->whereNull('payment_receipt');
            } else {
                $query->where('status', $request->status);
            }
        }

        // Filter by Room Type/ID
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        // Filter by Date Range
        if ($request->filled('start_date')) {
            $query->where('check_in', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('check_in', '<=', $request->end_date);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($payments);
    }

    // POST /api/admin/payments/{id}/verify
    public function verify(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:accept,reject',
        ]);

        $booking = Booking::findOrFail($id);

        if ($request->action === 'accept') {
            $booking->update(['status' => 'accepted']);
        } else {
            $booking->update(['status' => 'rejected']);
        }

        // Sync room availability
        if ($booking->room) {
            $bookingController = new BookingController();
            $bookingController->syncRoomAvailability($booking->room);
        }

        // Trigger Realtime update
        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

        return response()->json([
            'message' => 'Status pembayaran berhasil diperbarui',
            'booking' => $booking->load(['user', 'room']),
        ]);
    }

    // GET /api/admin/payments/export
    public function export(Request $request)
    {
        $query = Booking::with(['user', 'room']);

        if ($request->filled('status')) {
            if ($request->status === 'pending_receipt') {
                $query->where('status', 'pending')->whereNotNull('payment_receipt');
            } elseif ($request->status === 'unpaid') {
                $query->where('status', 'pending')->whereNull('payment_receipt');
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=laporan_pembayaran_" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($bookings) {
            $file = fopen('php://output', 'w');
            // CSV BOM for Excel compatibility in UTF-8
            fputs($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['ID Booking', 'Nama Penyewa', 'Kamar', 'Tipe Kamar', 'Check In', 'Check Out', 'Durasi (Bulan)', 'Total Tagihan', 'Status', 'Catatan']);

            foreach ($bookings as $b) {
                fputcsv($file, [
                    $b->id,
                    $b->user ? $b->user->name : 'N/A',
                    $b->room ? $b->room->name : 'N/A',
                    $b->room ? ucfirst($b->room->type) : 'N/A',
                    $b->check_in ? $b->check_in->format('Y-m-d') : '—',
                    $b->check_out ? $b->check_out->format('Y-m-d') : '—',
                    $b->duration_months,
                    $b->total_price,
                    $b->status,
                    $b->notes
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
