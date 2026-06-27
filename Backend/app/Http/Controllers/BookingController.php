<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Services\RealtimeService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // GET /api/bookings
    public function index(Request $request)
    {
        self::autoReleaseExpiredBookings();

        $user = $request->user();

        // Admin bisa lihat semua, user hanya punyanya sendiri
        if ($user->role === 'admin') {
            $bookings = Booking::with(['user', 'room'])->get();
        } else {
            $bookings = Booking::with('room')
                ->where('user_id', $user->id)
                ->get();
        }

        return response()->json($bookings);
    }

    // GET /api/bookings/{id}
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'room'])->findOrFail($id);

        // Pastikan user hanya bisa lihat booking miliknya
        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $request->validate([
            'room_id'         => 'required|exists:rooms,id',
            'check_in'        => 'required|date',
            'duration_months' => 'required|integer|min:1',
            'notes'           => 'nullable|string',
        ]);

        $room = Room::findOrFail($request->room_id);

        if ($room->status !== 'available') {
            return response()->json(['message' => 'Kamar tidak tersedia'], 422);
        }

        $checkIn   = \Carbon\Carbon::parse($request->check_in);
        $checkOut  = $checkIn->copy()->addMonths($request->duration_months);
        $totalPrice = $room->price * $request->duration_months;

        $booking = Booking::create([
            'user_id'         => $request->user()->id,
            'room_id'         => $request->room_id,
            'check_in'        => $checkIn,
            'check_out'       => $checkOut,
            'duration_months' => $request->duration_months,
            'total_price'     => $totalPrice,
            'status'          => 'pending',
            'notes'           => $request->notes,
        ]);

        // Update status kamar jadi booked
        $room->update(['status' => 'booked']);
        $room->refresh();

        $realtime = app(RealtimeService::class);
        $realtime->bookingCreated($booking);
        $realtime->roomUpdated($room);

        return response()->json([
            'message' => 'Booking berhasil dibuat',
            'booking' => $booking->load('room'),
        ], 201);
    }

    // PUT /api/bookings/{id} - update status/details (admin only)
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        $oldRoom = $booking->room;
        $user = $request->user();

        // 1. Jika bukan admin, hanya boleh update status booking miliknya menjadi 'ended' (mengosongkan kamar)
        if ($user->role !== 'admin') {
            if ($booking->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            if ($request->status !== 'ended') {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $request->validate([
                'status' => 'required|in:ended',
            ]);

            $booking->update(['status' => 'ended']);
            $this->syncRoomAvailability($oldRoom);

            app(RealtimeService::class)->roomUpdated($oldRoom->fresh());
            app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

            return response()->json([
                'message' => 'Masa sewa berhasil diakhiri',
                'booking' => $booking->load(['user', 'room']),
            ]);
        }

        // 2. Jika admin, jalankan fungsionalitas edit lengkap
        $request->validate([
            'status'          => 'nullable|in:pending,accepted,rejected,ended',
            'room_id'         => 'nullable|exists:rooms,id',
            'check_in'        => 'nullable|date',
            'duration_months' => 'nullable|integer|min:1',
            'notes'           => 'nullable|string',
            'renewal_action'  => 'nullable|in:approve,reject',
        ]);

        $updates = [];
        $roomChanged = false;
        $recalculateOutPrice = false;

        if ($request->has('status')) {
            $updates['status'] = $request->status;
        }

        if ($request->has('notes')) {
            $updates['notes'] = $request->notes;
        }

        if ($request->renewal_action === 'approve' && $booking->renewal_requested) {
            $duration = $booking->renewal_months;
            $updates['duration_months'] = $booking->duration_months + $duration;
            $updates['check_out'] = $booking->check_out->copy()->addMonths($duration);
            $updates['total_price'] = $booking->total_price + ($oldRoom->price * $duration);
            $updates['renewal_requested'] = false;
            $updates['renewal_months'] = 0;
        } elseif ($request->renewal_action === 'reject' && $booking->renewal_requested) {
            $updates['renewal_requested'] = false;
            $updates['renewal_months'] = 0;
        }

        $targetRoom = $oldRoom;
        if ($request->has('room_id') && (int)$request->room_id !== (int)$booking->room_id) {
            $newRoom = Room::findOrFail($request->room_id);
            if ($newRoom->status !== 'available') {
                return response()->json(['message' => 'Kamar tujuan tidak tersedia'], 422);
            }
            $updates['room_id'] = $request->room_id;
            $targetRoom = $newRoom;
            $roomChanged = true;
            $recalculateOutPrice = true;
        }

        if ($request->has('check_in') || $request->has('duration_months')) {
            $recalculateOutPrice = true;
        }

        if ($recalculateOutPrice) {
            $checkIn = $request->has('check_in') ? \Carbon\Carbon::parse($request->check_in) : $booking->check_in;
            $duration = $request->has('duration_months') ? (int)$request->duration_months : $booking->duration_months;
            
            $updates['check_in'] = $checkIn;
            $updates['duration_months'] = $duration;
            $updates['check_out'] = $checkIn->copy()->addMonths($duration);
            $updates['total_price'] = $targetRoom->price * $duration;
        }

        $booking->update($updates);
        $booking->refresh();

        if ($roomChanged) {
            $targetRoom->update(['status' => 'booked']);
            $this->syncRoomAvailability($oldRoom);
            $this->syncRoomAvailability($targetRoom);
            
            app(RealtimeService::class)->roomUpdated($oldRoom->fresh());
            app(RealtimeService::class)->roomUpdated($targetRoom->fresh());
        } elseif ($booking->status === 'rejected' || $booking->status === 'ended') {
            $this->syncRoomAvailability($booking->room);
        }

        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

        return response()->json([
            'message' => 'Pemesanan berhasil diupdate',
            'booking' => $booking->load(['user', 'room']),
        ]);
    }

    // DELETE /api/bookings/{id} (admin only)
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $room = $booking->room;
        $booking->delete();

        $this->syncRoomAvailability($room);

        return response()->json(['message' => 'Booking dihapus']);
    }

    // POST /api/bookings/{id}/renew (tenant only)
    public function requestRenewal(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'accepted') {
            return response()->json(['message' => 'Hanya pemesanan aktif yang dapat diperpanjang'], 422);
        }

        $request->validate([
            'duration_months' => 'required|integer|min:1',
        ]);

        $booking->update([
            'renewal_requested' => true,
            'renewal_months'    => $request->duration_months,
        ]);

        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

        return response()->json([
            'message' => 'Permintaan perpanjang sewa berhasil diajukan',
            'booking' => $booking->load(['user', 'room']),
        ]);
    }

    private function syncRoomAvailability(Room $room): void
    {
        $hasActiveBookings = $room->bookings()
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        $newStatus = $hasActiveBookings ? 'booked' : 'available';

        if ($room->status === $newStatus) {
            return;
        }

        $room->update(['status' => $newStatus]);
        app(RealtimeService::class)->roomUpdated($room->fresh());
    }

    public static function autoReleaseExpiredBookings()
    {
        $expiredBookings = Booking::where('status', 'accepted')
            ->where('check_out', '<=', now()->subDays(3)->toDateString())
            ->get();

        foreach ($expiredBookings as $booking) {
            $booking->update(['status' => 'ended']);
            
            $room = $booking->room;
            if ($room) {
                $hasActiveBookings = $room->bookings()
                    ->whereIn('status', ['pending', 'accepted'])
                    ->exists();
                $newStatus = $hasActiveBookings ? 'booked' : 'available';
                $room->update(['status' => $newStatus]);
                
                app(RealtimeService::class)->roomUpdated($room->fresh());
            }
            
            app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));
        }
    }
}
