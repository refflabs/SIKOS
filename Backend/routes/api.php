<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register',      [AuthController::class, 'register']);
Route::post('/login',         [AuthController::class, 'login']);
Route::post('/verify',        [AuthController::class, 'verify']);
Route::post('/verify/resend', [AuthController::class, 'resendOtp']);
Route::get('/ping', function () { return ['ping' => 'pong']; });

// Rooms - public (bisa dilihat tanpa login)
Route::get('/rooms',      [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// Protected routes (butuh token)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Bookings
    Route::get('/bookings',      [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings',     [BookingController::class, 'store']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::post('/bookings/{id}/renew', [BookingController::class, 'requestRenewal']);
    Route::post('/bookings/{id}/payment-receipt', [BookingController::class, 'uploadPaymentReceipt']);

    Route::middleware('admin')->group(function () {
        Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

        Route::post('/rooms',           [RoomController::class, 'store']);
        Route::put('/rooms/{id}',       [RoomController::class, 'update']);
        Route::delete('/rooms/{id}',    [RoomController::class, 'destroy']);
        Route::post('/rooms/upload-image', [RoomController::class, 'upload']);

        Route::get('/users',            [UserController::class, 'index']);
        Route::get('/users/{id}',       [UserController::class, 'show']);
        Route::put('/users/{id}',       [UserController::class, 'update']);
        Route::delete('/users/{id}',    [UserController::class, 'destroy']);
    });
});

