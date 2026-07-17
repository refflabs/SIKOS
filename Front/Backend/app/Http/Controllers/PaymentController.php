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
    /**
     * Menampilkan ringkasan statistik keuangan dan okupansi untuk dashboard Admin.
     * Menghitung total pendapatan (lunas), dana tertunda (menunggu verifikasi), total piutang,
     * statistik pendapatan bulanan, serta persentase keterisian kamar kost saat ini.
     */
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

    /**
     * Menampilkan daftar transaksi pembayaran dengan filter pencarian dan pagination.
     * Memungkinkan penyaringan data berdasarkan nama penyewa, ID booking, status pembayaran,
     * nomor kamar, serta rentang tanggal check-in.
     */
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

    /**
     * Melakukan verifikasi manual oleh Admin terhadap bukti transfer pembayaran (Accept/Reject).
     * Jika diterima, status booking menjadi 'accepted'. Jika ditolak, status booking menjadi 'rejected'.
     * Stok dan ketersediaan kamar terkait akan otomatis diselaraskan setelah verifikasi selesai.
     */
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

    /**
     * Mengekspor seluruh data laporan transaksi pembayaran ke file CSV (UTF-8 BOM).
     * Memudahkan admin untuk membuka laporan keuangan kos melalui Microsoft Excel atau aplikasi spreadsheet lainnya.
     */
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

        $format = $request->input('format', 'csv');

        // Jika format yang diminta adalah xlsx, ekspor menggunakan PhpSpreadsheet
        if ($format === 'xlsx') {
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Laporan Pembayaran');

            // Baris header
            $headers = ['ID Booking', 'Nama Penyewa', 'Kamar', 'Tipe Kamar', 'Check In', 'Check Out', 'Durasi (Bulan)', 'Total Tagihan', 'Status', 'Catatan'];
            $sheet->fromArray($headers, null, 'A1');

            // Atur agar lebar kolom otomatis pas dengan kontennya
            foreach (range('A', 'J') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Atur style font tebal (bold) untuk baris header
            $sheet->getStyle('A1:J1')->getFont()->setBold(true);

            // Tulis data baris per baris
            $rowNum = 2;
            foreach ($bookings as $b) {
                $row = [
                    $b->id,
                    $b->user ? $b->user->name : 'N/A',
                    $b->room ? $b->room->name : 'N/A',
                    $b->room ? ucfirst($b->room->type) : 'N/A',
                    $b->check_in ? $b->check_in->format('Y-m-d') : '—',
                    $b->check_out ? $b->check_out->format('Y-m-d') : '—',
                    $b->duration_months,
                    (float)$b->total_price,
                    strtoupper($b->status),
                    $b->notes
                ];
                $sheet->fromArray($row, null, 'A' . $rowNum);
                $rowNum++;
            }

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            
            return response()->stream(
                function() use ($writer) {
                    $writer->save('php://output');
                },
                200,
                [
                    "Content-type" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition" => "attachment; filename=laporan_pembayaran_" . date('Y-m-d') . ".xlsx",
                    "Pragma" => "no-cache",
                    "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
                    "Expires" => "0"
                ]
            );
        }

        // Default: Ekspor dalam format CSV
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=laporan_pembayaran_" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($bookings) {
            $file = fopen('php://output', 'w');
            // CSV BOM untuk kompabilitas UTF-8 di Excel
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

    /**
     * FUNGSI: Mendapatkan Snap Token dari Midtrans untuk pembayaran online.
     * KEGUNAAN: Fungsi ini dipanggil oleh frontend saat penyewa menekan tombol "Bayar Sekarang (Online)".
     *           Fungsi ini menyiapkan payload data transaksi (harga sewa, data diri pelanggan, detail kamar),
     *           lalu menembak API Midtrans Snap untuk meminta token pembayaran unik (snap_token).
     */
    public function getSnapToken(Request $request, $id)
    {
        // 1. Mengambil data booking beserta user dan kamar terkait dari database
        $booking = Booking::with(['user', 'room'])->findOrFail($id);

        // 2. Pastikan user (penyewa) hanya bisa membayar booking miliknya sendiri (kecuali admin)
        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 3. Jika booking sudah disetujui / lunas, tidak perlu dibayar lagi
        if ($booking->status === 'accepted') {
            return response()->json(['message' => 'Pemesanan ini sudah lunas/disetujui'], 422);
        }

        // 4. Optimasi: Gunakan token Snap yang sudah ada di database jika belum kedaluwarsa
        if ($booking->midtrans_snap_token && $booking->midtrans_order_id) {
            $isProduction = config('services.midtrans.is_production');
            $baseUrl = $isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
            return response()->json([
                'snap_token' => $booking->midtrans_snap_token,
                'redirect_url' => $baseUrl . '/snap/v2/vtweb/' . $booking->midtrans_snap_token
            ]);
        }

        // 5. Setup kredensial & URL Endpoint API Midtrans berdasarkan mode (Sandbox / Production)
        $serverKey = config('services.midtrans.server_key');
        $isProduction = config('services.midtrans.is_production');
        $snapUrl = $isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        // Format order_id unik: SIKOS-[id_booking]-[timestamp]
        $orderId = 'SIKOS-' . $booking->id . '-' . time();

        // 6. Menyusun payload JSON sesuai format standard API Midtrans
        $payload = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int)$booking->total_price,
            ],
            'customer_details' => [
                'first_name' => $booking->user->name,
                'email' => $booking->user->email,
                'phone' => $booking->user->phone ?? '',
            ],
            'item_details' => [
                [
                    'id' => 'room_' . $booking->room->id,
                    'price' => (int)$booking->room->price,
                    'quantity' => $booking->duration_months,
                    'name' => 'Sewa Kamar ' . $booking->room->name,
                ]
            ]
        ];

        // 7. Melakukan HTTP POST request ke Midtrans menggunakan basic auth (Username = serverKey, Password = kosong)
        $response = \Illuminate\Support\Facades\Http::withBasicAuth($serverKey, '')
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->post($snapUrl, $payload);

        // 8. Jika request sukses, simpan snap_token dan order_id ke database, lalu kembalikan ke frontend
        if ($response->successful()) {
            $result = $response->json();
            $booking->update([
                'midtrans_snap_token' => $result['token'],
                'midtrans_order_id' => $orderId,
            ]);
            return response()->json([
                'snap_token' => $result['token'],
                'redirect_url' => $result['redirect_url'],
            ]);
        }

        // 9. Kembalikan error jika gagal mendapat respon dari API Midtrans
        return response()->json([
            'message' => 'Gagal mendapatkan token pembayaran dari Midtrans',
            'error' => $response->json() ?? $response->body()
        ], 500);
    }

    /**
     * FUNGSI: Menerima Webhook / Notifikasi Pembayaran dari Midtrans secara real-time.
     * KEGUNAAN: Fungsi ini dipanggil otomatis oleh server Midtrans (HTTP POST) saat status transaksi berubah.
     *           Fungsi ini memverifikasi keaslian pengirim (signature_key), mencocokkan status transaksi,
     *           lalu memperbarui status pemesanan di database menjadi "accepted" (lunas) atau "rejected" (gagal).
     */
    public function handleNotification(Request $request)
    {
        $serverKey = config('services.midtrans.server_key');
        $orderId = $request->order_id;
        $statusCode = $request->status_code;
        $grossAmount = $request->gross_amount;

        // 1. Verifikasi Keamanan: Buat signature key lokal dengan rumus SHA512:
        //    hash('sha512', order_id + status_code + gross_amount + server_key)
        $input = $orderId . $statusCode . $grossAmount . $serverKey;
        $localSignature = hash('sha512', $input);

        // Pastikan signature key lokal cocok dengan signature_key yang dikirim Midtrans (mencegah manipulasi data)
        if ($localSignature !== $request->signature_key) {
            return response()->json(['message' => 'Signature key tidak valid'], 403);
        }

        // 2. Cari data booking berdasarkan midtrans_order_id di database
        $booking = Booking::where('midtrans_order_id', $orderId)->first();

        if (!$booking) {
            return response()->json(['message' => 'Transaksi booking tidak ditemukan'], 444);
        }

        // 3. Mapping status dari Midtrans ke status lokal aplikasi SIKOS
        $transactionStatus = $request->transaction_status;
        $paymentType = $request->payment_type;
        $fraudStatus = $request->fraud_status;

        $newStatus = null;

        if ($transactionStatus == 'capture') {
            if ($paymentType == 'credit_card') {
                if ($fraudStatus == 'challenge') {
                    $newStatus = 'pending';
                } else {
                    $newStatus = 'accepted'; // Lunas
                }
            }
        } elseif ($transactionStatus == 'settlement') {
            $newStatus = 'accepted'; // Sukses terbayar (Virtual Account, QRIS, GoPay, Alfamart dll)
        } elseif ($transactionStatus == 'pending') {
            $newStatus = 'pending'; // Menunggu pembayaran
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $newStatus = 'rejected'; // Ditolak, Kedaluwarsa, atau Dibatalkan
        }

        // 4. Jika status berubah, update database & jalankan logic pasca-pembayaran
        if ($newStatus && $booking->status !== $newStatus) {
            $booking->update(['status' => $newStatus]);
            
            // Sinkronisasi status ketersediaan kamar kost (stok kamar dibebaskan jika rejected)
            if ($booking->room) {
                $bookingController = new BookingController();
                $bookingController->syncRoomAvailability($booking->room);
            }

            // Memicu event Realtime WebSocket agar tampilan di Admin/User terupdate secara real-time
            app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));
        }

        return response()->json(['message' => 'Notification processed successfully']);
    }
}
