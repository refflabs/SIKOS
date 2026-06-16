<?php

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createUser(string $role = 'user'): User
{
    if ($role === 'admin') {
        return User::factory()->admin()->create();
    }

    return User::factory()->create();
}

function createRoom(array $overrides = []): Room
{
    return Room::create(array_merge([
        'name' => 'Kamar Test',
        'type' => 'single',
        'price' => 800000,
        'status' => 'available',
    ], $overrides));
}

function createBooking(Room $room, User $user, array $overrides = []): Booking
{
    return Booking::create(array_merge([
        'user_id' => $user->id,
        'room_id' => $room->id,
        'check_in' => now()->toDateString(),
        'check_out' => now()->addMonths(1)->toDateString(),
        'duration_months' => 1,
        'total_price' => 800000,
        'status' => 'pending',
    ], $overrides));
}

test('regular user cannot update booking status', function () {
    $user = createUser('user');
    $room = createRoom();
    $booking = createBooking($room, $user);

    Sanctum::actingAs($user);

    $this->putJson("/api/bookings/{$booking->id}", ['status' => 'confirmed'])
        ->assertForbidden();
});

test('regular user cannot delete booking', function () {
    $user = createUser('user');
    $room = createRoom();
    $booking = createBooking($room, $user);

    Sanctum::actingAs($user);

    $this->deleteJson("/api/bookings/{$booking->id}")
        ->assertForbidden();
});

test('admin can update booking status', function () {
    $admin = createUser('admin');
    $user = createUser('user');
    $room = createRoom();
    $booking = createBooking($room, $user);

    Sanctum::actingAs($admin);

    $this->putJson("/api/bookings/{$booking->id}", ['status' => 'confirmed'])
        ->assertOk()
        ->assertJsonPath('booking.status', 'confirmed');
});

test('regular user cannot create room', function () {
    Sanctum::actingAs(createUser('user'));

    $this->postJson('/api/rooms', [
        'name' => 'Kamar Baru',
        'type' => 'single',
        'price' => 900000,
    ])->assertForbidden();
});

test('admin can create room', function () {
    Sanctum::actingAs(createUser('admin'));

    $this->postJson('/api/rooms', [
        'name' => 'Kamar Baru',
        'type' => 'single',
        'price' => 900000,
    ])->assertCreated();
});

test('deleting booking keeps room booked when another active booking exists', function () {
    $admin = createUser('admin');
    $firstUser = createUser('user');
    $secondUser = User::factory()->create();
    $room = createRoom(['status' => 'booked']);

    $bookingToDelete = createBooking($room, $firstUser, ['status' => 'cancelled']);
    createBooking($room, $secondUser, ['status' => 'confirmed']);

    Sanctum::actingAs($admin);

    $this->deleteJson("/api/bookings/{$bookingToDelete->id}")
        ->assertOk();

    expect($room->fresh()->status)->toBe('booked');
});

test('deleting last active booking marks room available', function () {
    $admin = createUser('admin');
    $user = createUser('user');
    $room = createRoom(['status' => 'booked']);
    $booking = createBooking($room, $user, ['status' => 'confirmed']);

    Sanctum::actingAs($admin);

    $this->deleteJson("/api/bookings/{$booking->id}")
        ->assertOk();

    expect($room->fresh()->status)->toBe('available');
});

test('admin cannot set room status on create', function () {
    Sanctum::actingAs(createUser('admin'));

    $this->postJson('/api/rooms', [
        'name' => 'Kamar Baru',
        'type' => 'single',
        'price' => 900000,
        'status' => 'booked',
    ])->assertCreated();

    expect(Room::where('name', 'Kamar Baru')->first()->status)->toBe('available');
});

test('admin cannot set room status on update', function () {
    $room = createRoom(['status' => 'booked']);

    Sanctum::actingAs(createUser('admin'));

    $this->putJson("/api/rooms/{$room->id}", [
        'name' => 'Kamar Updated',
        'status' => 'available',
    ])->assertOk();

    $room->refresh();
    expect($room->name)->toBe('Kamar Updated');
    expect($room->status)->toBe('booked');
});

test('admin room update rejects invalid price', function () {
    $room = createRoom();

    Sanctum::actingAs(createUser('admin'));

    $this->putJson("/api/rooms/{$room->id}", [
        'price' => -100,
    ])->assertUnprocessable();
});
