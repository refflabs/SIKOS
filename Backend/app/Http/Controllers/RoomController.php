<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // GET /api/rooms
    public function index(Request $request)
    {
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
        $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string',
            'price'       => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image'       => 'nullable|string',
            'floor'       => 'nullable|integer',
            'size'        => 'nullable|string',
            'facilities'  => 'nullable|array',
        ]);

        $room = Room::create($request->all());

        return response()->json([
            'message' => 'Kamar berhasil ditambahkan',
            'room'    => $room,
        ], 201);
    }

    // PUT /api/rooms/{id}
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);
        $room->update($request->all());

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
}
