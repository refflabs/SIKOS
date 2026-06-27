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
            'name'     => 'Admin Kost',
            'email'    => 'admin@kost.com',
            'password' => Hash::make('password'),
            'phone'    => '081234567890',
        ]);
        $admin->forceFill(['role' => 'admin'])->save();

        // Buat user contoh
        User::create([
            'name'     => 'Budi Santoso',
            'email'    => 'budi@example.com',
            'password' => Hash::make('password'),
            'phone'    => '089876543210',
        ]);

        // Buat kamar contoh
        $rooms = [
            [
                'name'        => 'Kamar A1',
                'type'        => 'single',
                'price'       => 800000,
                'status'      => 'available',
                'description' => 'Kamar single nyaman dengan jendela besar menghadap taman.',
                'facilities'  => ['WiFi', 'AC', 'Lemari', 'Meja Belajar'],
                'floor'       => 1,
                'size'        => '3x4 m',
            ],
            [
                'name'        => 'Kamar A2',
                'type'        => 'single',
                'price'       => 800000,
                'status'      => 'booked',
                'description' => 'Kamar single dengan kamar mandi dalam.',
                'facilities'  => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'Lemari'],
                'floor'       => 1,
                'size'        => '3x4 m',
            ],
            [
                'name'        => 'Kamar B1',
                'type'        => 'double',
                'price'       => 1200000,
                'status'      => 'available',
                'description' => 'Kamar double luas, cocok untuk pasangan atau keluarga kecil.',
                'facilities'  => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'Lemari Besar', 'TV'],
                'floor'       => 2,
                'size'        => '4x5 m',
            ],
            [
                'name'        => 'Kamar B2',
                'type'        => 'double',
                'price'       => 1200000,
                'status'      => 'available',
                'description' => 'Kamar double dengan balkon.',
                'facilities'  => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'Balkon', 'TV'],
                'floor'       => 2,
                'size'        => '4x5 m',
            ],
            [
                'name'        => 'Kamar Suite',
                'type'        => 'suite',
                'price'       => 2000000,
                'status'      => 'available',
                'description' => 'Kamar suite premium dengan fasilitas lengkap.',
                'facilities'  => ['WiFi', 'AC', 'Kamar Mandi Dalam', 'Dapur Kecil', 'TV', 'Kulkas'],
                'floor'       => 3,
                'size'        => '6x6 m',
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }

        // --- BUAT USER DUMMY PERPANJANGAN (WARNING & EXPIRED) ---
        // 1. User Kasus 1: Budi Peringatan (Tenggat sewa 5 hari lagi)
        $userWarning = User::create([
            'name'     => 'Budi Peringatan',
            'email'    => 'warning@sikos.com',
            'password' => Hash::make('password'),
            'phone'    => '081111111111',
        ]);

        $roomB2 = Room::where('name', 'Kamar B2')->first();
        if ($roomB2) {
            $roomB2->update(['status' => 'booked']);
            \App\Models\Booking::create([
                'user_id'         => $userWarning->id,
                'room_id'         => $roomB2->id,
                'check_in'        => now()->subDays(25),
                'check_out'       => now()->addDays(5),
                'status'          => 'accepted',
                'duration_months' => 1,
                'total_price'     => $roomB2->price,
            ]);
        }

        // 2. User Kasus 2: Andi Tenggat (Tenggat sewa lewat 1 hari)
        $userExpired = User::create([
            'name'     => 'Andi Tenggat',
            'email'    => 'expired@sikos.com',
            'password' => Hash::make('password'),
            'phone'    => '082222222222',
        ]);

        $roomSuite = Room::where('name', 'Kamar Suite')->first();
        if ($roomSuite) {
            $roomSuite->update(['status' => 'booked']);
            \App\Models\Booking::create([
                'user_id'         => $userExpired->id,
                'room_id'         => $roomSuite->id,
                'check_in'        => now()->subDays(31),
                'check_out'       => now()->subDays(1),
                'status'          => 'accepted',
                'duration_months' => 1,
                'total_price'     => $roomSuite->price,
            ]);
        }
    }
}
