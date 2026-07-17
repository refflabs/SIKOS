<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Menampilkan daftar semua kamar kost.
     * Mengatur pelepasan otomatis untuk penyewaan yang kedaluwarsa sebelum mengambil data.
     * Dapat difilter berdasarkan status kamar, tipe (kosongan/fasilitas), dan harga maksimal.
     */
    public function index(Request $request)
    {
        BookingController::autoReleaseExpiredBookings();
        $query = Room::query();

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by harga max
        if ($request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        return response()->json($query->get());
    }

    /**
     * Menampilkan informasi detail satu kamar berdasarkan ID.
     */
    public function show($id)
    {
        $room = Room::findOrFail($id);
        return response()->json($room);
    }

    /**
     * Menambahkan data kamar kost baru ke dalam database (Hanya Admin).
     * Jika nilai stok kamar tidak diatur, nilainya akan disamakan secara default dengan kapasitas kamar.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
            'floor'       => 'nullable|integer',
            'size'        => 'nullable|string',
            'facilities'  => 'nullable|array',
            'capacity'    => 'nullable|integer',
            'stock'       => 'nullable|integer',
        ]);

        if (!isset($validated['stock']) && isset($validated['capacity'])) {
            $validated['stock'] = $validated['capacity'];
        }

        $room = Room::create($validated);

        return response()->json([
            'message' => 'Kamar berhasil ditambahkan',
            'room'    => $room,
        ], 201);
    }

    /**
     * Mengupdate data informasi kamar kost yang sudah ada berdasarkan ID (Hanya Admin).
     * Melakukan sinkronisasi ketersediaan kamar secara otomatis setelah diperbarui.
     */
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'type'        => 'sometimes|required|string',
            'price'       => 'sometimes|required|numeric|min:0',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
            'floor'       => 'nullable|integer',
            'size'        => 'nullable|string',
            'facilities'  => 'nullable|array',
            'capacity'    => 'nullable|integer',
            'stock'       => 'nullable|integer',
        ]);

        $room->update($validated);

        // Sync availability
        (new BookingController)->syncRoomAvailability($room);

        return response()->json([
            'message' => 'Kamar berhasil diupdate',
            'room'    => $room,
        ]);
    }

    /**
     * Menghapus data kamar kost dari database berdasarkan ID (Hanya Admin).
     */
    public function destroy($id)
    {
        Room::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    /**
     * Mengunggah file gambar kamar kost ke direktori publik server (Hanya Admin).
     * Gambar disimpan di folder 'public/uploads' dengan nama file unik dan mengembalikan URL absolut gambar.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Move file to public/uploads
            $file->move(public_path('uploads'), $filename);

            // Construct full URL using request's scheme and host
            $url = $request->getSchemeAndHttpHost() . '/uploads/' . $filename;

            return response()->json([
                'message' => 'Gambar berhasil diupload',
                'url'     => $url,
            ]);
        }

        return response()->json([
            'message' => 'File tidak ditemukan',
        ], 400);
    }
}

