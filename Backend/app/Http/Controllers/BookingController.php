<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Services\RealtimeService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Menampilkan daftar pemesanan (booking).
     * Jika pengguna adalah admin, tampilkan semua data pemesanan beserta informasi kamar dan penyewa.
     * Jika pengguna adalah penyewa biasa, hanya tampilkan data pemesanan miliknya sendiri.
     */
    public function index(Request $request)
    {
        self::autoReleaseExpiredBookings();

        $user = $request->user();

        // Admin bisa lihat semua, user hanya punyanya sendiri
        if ($user->role === 'admin') {
            $bookings = Booking::select('id', 'user_id', 'room_id', 'check_in', 'check_out', 'duration_months', 'total_price', 'occupant_count', 'status', 'notes', 'created_at', 'updated_at', 'renewal_requested', 'renewal_months')
                ->selectRaw('CASE WHEN payment_receipt IS NOT NULL AND payment_receipt != \'\' THEN 1 ELSE 0 END as has_payment_receipt')
                ->with(['user', 'room'])
                ->get();
        } else {
            $bookings = Booking::select('id', 'user_id', 'room_id', 'check_in', 'check_out', 'duration_months', 'total_price', 'occupant_count', 'status', 'notes', 'created_at', 'updated_at', 'renewal_requested', 'renewal_months')
                ->selectRaw('CASE WHEN payment_receipt IS NOT NULL AND payment_receipt != \'\' THEN 1 ELSE 0 END as has_payment_receipt')
                ->with('room')
                ->where('user_id', $user->id)
                ->get();
        }

        return response()->json($bookings);
    }

    /**
     * Menampilkan detail informasi dari satu pemesanan berdasarkan ID.
     * Hanya admin atau penyewa pemilik pemesanan tersebut yang diizinkan mengakses.
     */
    public function show(Request $request, $id)
    {
        $booking = Booking::with(['user', 'room'])->findOrFail($id);

        // Pastikan user hanya bisa lihat booking miliknya
        if ($request->user()->role !== 'admin' && $booking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($booking);
    }

    /**
     * Membuat data pemesanan baru (booking kamar).
     * Memvalidasi durasi dan tanggal check-in, mengurangi stok kamar yang bersangkutan,
     * serta mem-broadcast update informasi kamar secara realtime.
     */
    public function store(Request $request)
    {
        $request->validate([
            'room_id'         => 'required|exists:rooms,id',
            'check_in'        => 'required|date',
            'duration_months' => 'required|integer|min:1',
            'notes'           => 'nullable|string',
            'occupant_count'  => 'nullable|integer|min:1|max:2',
        ]);

        // 1. Cari data kamar yang dipilih
        $room = Room::findOrFail($request->room_id);

        // 2. Pastikan stok kamar masih tersedia (lebih dari 0)
        if ($room->stock <= 0) {
            return response()->json(['message' => 'Stok kamar tipe ini habis'], 422);
        }

        // 3. Hitung tanggal check-out (check-in + durasi sewa) dan total harga sewa
        $checkIn   = \Carbon\Carbon::parse($request->check_in);
        $checkOut  = $checkIn->copy()->addMonths($request->duration_months);
        
        $occupantCount = (int)$request->input('occupant_count', 1);
        $monthlyPrice  = $room->price;
        if ($occupantCount === 2) {
            $monthlyPrice += 100000;
        }
        
        $totalPrice = $monthlyPrice * $request->duration_months;

        // 4. Buat record booking baru dengan status awal 'pending'
        $booking = Booking::create([
            'user_id'         => $request->user()->id,
            'room_id'         => $request->room_id,
            'check_in'        => $checkIn,
            'check_out'       => $checkOut,
            'duration_months' => $request->duration_months,
            'occupant_count'  => $occupantCount,
            'total_price'     => $totalPrice,
            'status'          => 'pending',
            'notes'           => $request->notes,
        ]);

        // 5. Kurangi stok kamar dan update status kamar menjadi 'booked' jika stok habis
        $room->decrement('stock');
        $room->update(['status' => $room->stock > 0 ? 'available' : 'booked']);
        $room->refresh();

        $realtime = app(RealtimeService::class);
        $realtime->bookingCreated($booking);
        $realtime->roomUpdated($room);

        return response()->json([
            'message' => 'Booking berhasil dibuat',
            'booking' => $booking->load('room'),
        ], 201);
    }

    /**
     * Mengubah data pemesanan atau status sewa (oleh Admin atau Penyewa).
     * Penyewa hanya diizinkan untuk mengakhiri sewa ('ended').
     * Admin memiliki akses penuh untuk mengubah kamar, tanggal check-in, durasi, dan menyetujui/menolak perpanjangan sewa.
     */
    public function update(Request $request, $id)
    {
        // 1. Pemuatan data booking untuk di-update
        $booking = Booking::findOrFail($id);
        $oldRoom = $booking->room;
        $user = $request->user();

        // 2. JALUR NON-ADMIN (Penyewa): Boleh menghentikan sewa ('ended') atau membatalkan booking ('rejected')
        if ($user->role !== 'admin') {
            if ($booking->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $request->validate([
                'status' => 'required|in:ended,rejected',
                'notes'  => 'nullable|string|max:500',
            ]);

            if ($request->status === 'rejected') {
                // Hanya boleh membatalkan booking jika saat ini pending atau rejected
                if (!in_array($booking->status, ['pending', 'rejected'])) {
                    return response()->json(['message' => 'Hanya booking berstatus pending atau ditolak yang dapat dibatalkan.'], 422);
                }
                
                $booking->update([
                    'status' => 'rejected',
                    'notes' => $request->notes ?? $booking->notes
                ]);
                $this->syncRoomAvailability($oldRoom);

                // Kirim notifikasi realtime
                app(RealtimeService::class)->roomUpdated($oldRoom->fresh());
                app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

                return response()->json([
                    'message' => 'Pemesanan berhasil dibatalkan',
                    'booking' => $booking->load(['user', 'room']),
                ]);
            }

            // Jika mengakhiri sewa ('ended')
            $booking->update(['status' => 'ended']);
            $this->syncRoomAvailability($oldRoom);

            // Kirim notifikasi realtime
            app(RealtimeService::class)->roomUpdated($oldRoom->fresh());
            app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

            return response()->json([
                'message' => 'Masa sewa berhasil diakhiri',
                'booking' => $booking->load(['user', 'room']),
            ]);
        }

        // 3. JALUR ADMIN: Memiliki kontrol penuh untuk merubah detail booking
        $request->validate([
            'status'          => 'nullable|in:pending,accepted,rejected,ended',
            'room_id'         => 'nullable|exists:rooms,id',
            'check_in'        => 'nullable|date',
            'duration_months' => 'nullable|integer|min:1',
            'notes'           => 'nullable|string',
            'occupant_count'  => 'nullable|integer|min:1|max:2',
            'renewal_action'  => 'nullable|in:approve,reject',
        ]);

        $updates = [];
        $roomChanged = false;
        $recalculateOutPrice = false;

        // Atur perubahan status
        if ($request->has('status')) {
            $updates['status'] = $request->status;
        }

        if ($request->has('notes')) {
            $updates['notes'] = $request->notes;
        }

        if ($request->has('occupant_count')) {
            $updates['occupant_count'] = (int)$request->occupant_count;
            $recalculateOutPrice = true;
        }

        // Penanganan Persetujuan Perpanjangan Sewa (Renewal)
        if ($request->renewal_action === 'approve' && $booking->renewal_requested) {
            $duration = $booking->renewal_months;
            $updates['duration_months'] = $booking->duration_months + $duration;
            $updates['check_out'] = $booking->check_out->copy()->addMonths($duration);
            
            $monthlyPrice = $oldRoom->price;
            if ($booking->occupant_count === 2) {
                $monthlyPrice += 100000;
            }
            
            $updates['total_price'] = $booking->total_price + ($monthlyPrice * $duration);
            $updates['renewal_requested'] = false;
            $updates['renewal_months'] = 0;
        } elseif ($request->renewal_action === 'reject' && $booking->renewal_requested) {
            $updates['renewal_requested'] = false;
            $updates['renewal_months'] = 0;
        }

        // Penanganan Perubahan Kamar Kost
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

        // Periksa jika tanggal check-in atau durasi sewa berubah untuk kalkulasi ulang
        if ($request->has('check_in') || $request->has('duration_months')) {
            $recalculateOutPrice = true;
        }

        // Kalkulasi Ulang Tanggal Check-out & Total Harga
        if ($recalculateOutPrice) {
            $checkIn = $request->has('check_in') ? \Carbon\Carbon::parse($request->check_in) : $booking->check_in;
            $duration = $request->has('duration_months') ? (int)$request->duration_months : $booking->duration_months;
            $occupantCount = $request->has('occupant_count') ? (int)$request->occupant_count : ($updates['occupant_count'] ?? $booking->occupant_count);
            
            $updates['check_in'] = $checkIn;
            $updates['duration_months'] = $duration;
            $updates['check_out'] = $checkIn->copy()->addMonths($duration);
            
            $monthlyPrice = $targetRoom->price;
            if ($occupantCount === 2) {
                $monthlyPrice += 100000;
            }
            
            $updates['total_price'] = $monthlyPrice * $duration;
        }

        // Lakukan pembaruan ke database
        $booking->update($updates);
        $booking->refresh();

        if ($roomChanged) {
            $this->syncRoomAvailability($oldRoom);
            $this->syncRoomAvailability($targetRoom);
        } else {
            $this->syncRoomAvailability($booking->room);
        }

        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));

        return response()->json([
            'message' => 'Pemesanan berhasil diupdate',
            'booking' => $booking->load(['user', 'room']),
        ]);
    }

    /**
     * Menghapus data pemesanan (Hanya Admin).
     * Setelah dihapus, stok dan ketersediaan kamar terkait akan otomatis disinkronkan kembali.
     */
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $room = $booking->room;
        $booking->delete();

        $this->syncRoomAvailability($room);

        return response()->json(['message' => 'Booking dihapus']);
    }

    /**
     * Mengajukan permintaan perpanjangan durasi sewa kamar (Oleh Penyewa).
     * Hanya dapat diajukan jika sewa masih aktif (status 'accepted') dan belum berakhir.
     */
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

    /**
     * Menyinkronkan ketersediaan stok dan status kamar berdasarkan jumlah pemesanan aktif.
     * Stok dihitung dari kapasitas kamar dikurangi pemesanan dengan status 'pending' atau 'accepted'.
     */
    public function syncRoomAvailability(Room $room): void
    {
        $activeBookings = $room->bookings()
            ->whereIn('status', ['pending', 'accepted'])
            ->count();

        $newStock = max(0, $room->capacity - $activeBookings);
        $newStatus = $newStock > 0 ? 'available' : 'booked';

        $room->update([
            'stock'  => $newStock,
            'status' => $newStatus
        ]);

        app(RealtimeService::class)->roomUpdated($room->fresh());
    }

    /**
     * Melepaskan (release) otomatis kamar dari pemesanan yang masa sewanya sudah kedaluwarsa.
     * Mengubah status pemesanan menjadi 'ended' setelah lewat 3 hari dari tanggal check-out.
     * Fungsi ini dibatasi (throttled) agar hanya berjalan maksimal sekali setiap 10 menit demi efisiensi performa.
     */
    public static function autoReleaseExpiredBookings()
    {
        try {
            // Throttle check to once every 10 minutes to prevent slow page loads from duplicate concurrent runs
            $cacheKey = 'sikos_last_auto_release';
            try {
                $lastChecked = cache($cacheKey);
                if ($lastChecked && now()->diffInMinutes($lastChecked) < 10) {
                    return;
                }
                cache([$cacheKey => now()], now()->addMinutes(15));
            } catch (\Throwable $e) {
                // Fallback silently if cache is unavailable
            }

            $expiredBookings = Booking::where('status', 'accepted')
                ->where('check_out', '<=', now()->subDays(3)->toDateString())
                ->get();

            foreach ($expiredBookings as $booking) {
                try {
                    $booking->update(['status' => 'ended']);
                    
                    $room = $booking->room;
                    if ($room) {
                        $controller = new self();
                        $controller->syncRoomAvailability($room);
                    }
                    
                    try {
                        app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));
                    } catch (\Throwable $re) {
                        \Illuminate\Support\Facades\Log::warning('Realtime failed in autoRelease: ' . $re->getMessage());
                    }
                } catch (\Throwable $be) {
                    \Illuminate\Support\Facades\Log::warning('Failed to process single expired booking: ' . $be->getMessage());
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('autoReleaseExpiredBookings global failure: ' . $e->getMessage());
        }
    }

    /**
     * Mengunggah foto bukti pembayaran transfer manual (Base64) untuk pemesanan tertentu.
     * Berfungsi memicu update realtime ke admin untuk segera diverifikasi.
     */
    public function uploadPaymentReceipt(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|string',
        ]);

        $booking = Booking::findOrFail($id);
        $base64Image = $request->image;
        $url = null;

        if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $typeMatch)) {
            $type = strtolower($typeMatch[1]); // png, jpg, jpeg, gif, webp

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                return response()->json(['message' => 'Format gambar tidak valid. Hanya menerima jpg, jpeg, png, gif, webp'], 422);
            }

            $rawBase64 = substr($base64Image, strpos($base64Image, ',') + 1);
            $rawBase64 = str_replace(' ', '+', $rawBase64);
            $decodedData = base64_decode($rawBase64);

            if ($decodedData === false) {
                return response()->json(['message' => 'Gagal membaca gambar'], 422);
            }

            // Batasi ukuran file dekode maksimal 10MB
            if (strlen($decodedData) > 10 * 1024 * 1024) {
                return response()->json(['message' => 'Ukuran file maksimal adalah 10MB'], 422);
            }

            $filename = 'receipt_' . time() . '_' . uniqid() . '.' . $type;
            
            // Coba simpan ke folder uploads jika filesystem diizinkan (writable)
            try {
                $uploadDir = public_path('uploads');
                if (!file_exists($uploadDir)) {
                    @mkdir($uploadDir, 0755, true);
                }
                
                if (is_dir($uploadDir) && is_writable($uploadDir)) {
                    $filePath = $uploadDir . '/' . $filename;
                    if (@file_put_contents($filePath, $decodedData) !== false) {
                        $url = $request->getSchemeAndHttpHost() . '/uploads/' . $filename;
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Local file save failed, using base64 fallback: ' . $e->getMessage());
            }

            // Jika gagal menyimpan ke file lokal (misal Vercel serverless read-only), gunakan string Base64 langsung
            if (!$url) {
                $url = $request->image;
            }
        } else {
            // Jika dikirim sebagai URL biasa
            $url = $base64Image;
        }

        $booking->update([
            'payment_receipt' => $url
        ]);

        // Broadcast real-time update secara aman
        try {
            app(RealtimeService::class)->bookingStatusChanged($booking->fresh(['user', 'room']));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Realtime broadcast failed on receipt upload: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah',
            'booking' => $booking,
        ]);
    }
}
