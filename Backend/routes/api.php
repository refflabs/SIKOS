<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rooms - public (bisa dilihat tanpa login)
Route::get('/rooms',      [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// Protected routes (butuh token)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Bookings
    Route::get('/bookings',          [BookingController::class, 'index']);
    Route::get('/bookings/{id}',     [BookingController::class, 'show']);
    Route::post('/bookings',         [BookingController::class, 'store']);
    Route::put('/bookings/{id}',     [BookingController::class, 'update']);
    Route::delete('/bookings/{id}',  [BookingController::class, 'destroy']);

    // Rooms - hanya admin yang bisa CRUD
    Route::post('/rooms',            [RoomController::class, 'store']);
    Route::put('/rooms/{id}',        [RoomController::class, 'update']);
    Route::delete('/rooms/{id}',     [RoomController::class, 'destroy']);
});
