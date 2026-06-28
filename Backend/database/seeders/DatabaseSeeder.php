<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat admin
        $admin = User::create([
            'name'              => 'Admin Kost',
            'email'             => 'admin@kost.com',
            'password'          => Hash::make('password'),
            'phone'             => '081234567890',
            'email_verified_at' => now(),
        ]);
        $admin->forceFill(['role' => 'admin'])->save();

        // Buat user contoh
        User::create([
            'name'              => 'Budi Santoso',
            'email'             => 'budi@example.com',
            'password'          => Hash::make('password'),
            'phone'             => '089876543210',
            'email_verified_at' => now(),
        ]);

        // Buat 2 Tipe Kamar
        Room::create([
            'name'        => 'Kamar Kosongan',
            'type'        => 'kosongan',
            'price'       => 500000,
            'status'      => 'available',
            'description' => 'Kamar kosongan tanpa fasilitas tambahan. Listrik sudah termasuk, kamar mandi luar.',
            'image'       => '/images/kosongan.jpg',
            'facilities'  => [],
            'floor'       => null,
            'size'        => '3x4 m',
            'capacity'    => 10,
            'stock'       => 10,
        ]);

        Room::create([
            'name'        => 'Kamar Isian',
            'type'        => 'fasilitas',
            'price'       => 600000,
            'status'      => 'available',
            'description' => 'Kamar dengan fasilitas kasur, lemari, dan kipas angin. Listrik sudah termasuk, kamar mandi luar.',
            'image'       => '/images/fasilitas.jpg',
            'facilities'  => ['Kasur', 'Lemari', 'Kipas'],
            'floor'       => null,
            'size'        => '3x4 m',
            'capacity'    => 13,
            'stock'       => 13,
        ]);
    }
}
