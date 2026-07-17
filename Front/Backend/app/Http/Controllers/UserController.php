<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Menampilkan daftar semua pengguna dengan role 'user' (Penyewa Kos).
     * Dapat disaring menggunakan pencarian berdasarkan nama, email, atau nomor HP.
     */
    public function index(Request $request)
    {
        $query = User::query()->where('role', 'user');

        // Search filter
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json($query->get());
    }

    /**
     * Menampilkan informasi detail dari satu pengguna berdasarkan ID.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Mengupdate informasi data profil pengguna berdasarkan ID (Hanya Admin).
     * Meng-hash ulang password secara otomatis jika ada perubahan password baru.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string',
            'role'     => 'sometimes|required|string|in:user,admin',
            'password' => 'nullable|string|min:8',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'user'    => $user,
        ]);
    }

    /**
     * Menghapus akun pengguna berdasarkan ID (Hanya Admin).
     * Memiliki validasi pencegahan agar Admin tidak menghapus akun dirinya sendiri.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent self deletion
        if (auth()->id() == $id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus',
        ]);
    }
}
