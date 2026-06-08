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

    // PUT /api/bookings/{id} - update status (admin only)
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        // Kalau cancelled, kembalikan status kamar jadi available
        if ($request->status === 'cancelled') {
            $booking->room->update(['status' => 'available']);
            app(RealtimeService::class)->roomUpdated($booking->room->fresh());
        }

        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

        return response()->json([
            'message' => 'Status booking diupdate',
            'booking' => $booking,
        ]);
    }

    // DELETE /api/bookings/{id}
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $room = $booking->room;
        $room->update(['status' => 'available']);
        $booking->delete();

        app(RealtimeService::class)->roomUpdated($room->fresh());

        return response()->json(['message' => 'Booking dihapus']);
    }
}
