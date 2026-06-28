<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // GET /api/rooms
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

    // GET /api/rooms/{id}
    public function show($id)
    {
        $room = Room::findOrFail($id);
        return response()->json($room);
    }

    // POST /api/rooms
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

    // PUT /api/rooms/{id}
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

    // DELETE /api/rooms/{id}
    public function destroy($id)
    {
        Room::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    // POST /api/rooms/upload-image
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

