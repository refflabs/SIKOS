<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RealtimeService
{
    public function emit(string $eventKey, array $payload, ?string $channelKey = null): void
    {
        $url = config('services.realtime.url');
        $secret = config('services.realtime.secret');

        if (!$url) {
            return;
        }

        $event = config("realtime.events.{$eventKey}");
        if (!$event) {
            Log::warning("Realtime: unknown event key [{$eventKey}]");
            return;
        }

        $room = $channelKey ? config("realtime.channels.{$channelKey}") : null;

        $envelope = [
            'type'    => $event,
            'payload' => $payload,
            'meta'    => [
                'version'   => config('realtime.envelope_version', 1),
                'timestamp' => now()->toIso8601String(),
            ],
        ];

        try {
            $response = Http::timeout(1)
                ->withHeaders(['X-Socket-Secret' => $secret])
                ->post(rtrim($url, '/') . '/broadcast', [
                    'event' => $event,
                    'data'  => $envelope,
                    'room'  => $room,
                ]);

            if (!$response->successful()) {
                Log::warning('Realtime broadcast rejected', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Realtime broadcast failed: ' . $e->getMessage());
        }
    }

    public function bookingCreated(Booking $booking): void
    {
        $booking->loadMissing(['user', 'room']);

        $this->emit('booking_created', [
            'id'          => $booking->id,
            'user_id'     => $booking->user_id,
            'user_name'   => $booking->user?->name,
            'room_id'     => $booking->room_id,
            'room_name'   => $booking->room?->name,
            'status'      => $booking->status,
            'total_price' => $booking->total_price,
            'check_in'    => $booking->check_in?->toDateString(),
        ], 'admin');

        $this->emitBookingsStats();
    }

    public function bookingStatusChanged(Booking $booking): void
    {
        $booking->loadMissing(['user', 'room']);

        $this->emit('booking_status_changed', [
            'id'        => $booking->id,
            'status'    => $booking->status,
            'room_id'   => $booking->room_id,
            'room_name' => $booking->room?->name,
            'user_name' => $booking->user?->name,
        ], 'admin');

        $this->emitBookingsStats();
    }

    public function roomUpdated($room): void
    {
        $this->emit('room_updated', $room->toArray(), 'public');
    }

    public function emitBookingsStats(): void
    {
        $this->emit('bookings_updated', [
            'total'   => Booking::count(),
            'pending' => Booking::where('status', 'pending')->count(),
        ], 'admin');
    }
}
