<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->symbols()],
            'phone'    => ['required', 'string', 'regex:/^\+?[0-9]{9,15}$/'],
        ], [
            'name.regex'  => 'Nama lengkap hanya boleh mengandung huruf dan spasi.',
            'phone.regex' => 'Format nomor HP tidak valid. Hanya menerima angka (contoh: 08xxxxx atau +62xxxxx) dengan panjang 9-15 digit.',
        ]);

        $disposableDomains = [
            'mailinator.com', 'yopmail.com', '10minutemail.com', 'temp-mail.org', 
            'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com', 
            'maildrop.cc', 'mintemail.com', 'throwawaymail.com', 'tempmail.com', 
            'emailondash.com', 'generator.email', 'tempr.email', 'mailnesia.com', 'mailcatch.com'
        ];

        $email = $request->email;
        $domain = substr(strrchr($email, "@"), 1);

        if (in_array(strtolower($domain), $disposableDomains)) {
            throw ValidationException::withMessages([
                'email' => ['Pendaftaran gagal. Email menggunakan domain temporary/disposable yang tidak diizinkan.'],
            ]);
        }

        $otp = (string) rand(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        $user = User::create([
            'name'                        => $request->name,
            'email'                       => $request->email,
            'password'                    => Hash::make($request->password),
            'phone'                       => $request->phone,
            'verification_otp'            => $otp,
            'verification_otp_expires_at' => $expiresAt,
            'email_verified_at'           => null,
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SendOTPMail($otp, $user->name));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email OTP: " . $e->getMessage());
        }

        $response = [
            'message' => 'Registrasi berhasil. Silakan verifikasi akun Anda.',
            'email'   => $user->email,
        ];

        if (config('app.debug') || app()->environment('local', 'testing')) {
            $response['_debug_otp'] = $otp;
        }

        return response()->json($response, 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = Auth::user();

        if (is_null($user->email_verified_at)) {
            Auth::logout();

            $otp = (string) rand(100000, 999999);
            $user->update([
                'verification_otp'            => $otp,
                'verification_otp_expires_at' => now()->addMinutes(15),
            ]);

            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SendOTPMail($otp, $user->name));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Gagal mengirim email OTP: " . $e->getMessage());
            }

            $response = [
                'message'    => 'Akun Anda belum terverifikasi. Silakan lakukan verifikasi.',
                'unverified' => true,
                'email'      => $user->email,
            ];

            if (config('app.debug') || app()->environment('local', 'testing')) {
                $response['_debug_otp'] = $otp;
            }

            return response()->json($response, 403);
        }

        BookingController::autoReleaseExpiredBookings();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->verification_otp !== $request->otp) {
            throw ValidationException::withMessages([
                'otp' => ['Kode OTP salah.'],
            ]);
        }

        if (now()->greaterThan($user->verification_otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Kode OTP telah kadaluwarsa.'],
            ]);
        }

        $user->update([
            'email_verified_at'           => now(),
            'verification_otp'            => null,
            'verification_otp_expires_at' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Akun berhasil diverifikasi.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Akun ini sudah terverifikasi.',
            ], 422);
        }

        $otp = (string) rand(100000, 999999);
        $user->update([
            'verification_otp'            => $otp,
            'verification_otp_expires_at' => now()->addMinutes(15),
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SendOTPMail($otp, $user->name));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email OTP: " . $e->getMessage());
        }

        $response = [
            'message' => 'Kode OTP baru berhasil dikirim.',
            'email'   => $user->email,
        ];

        if (config('app.debug') || app()->environment('local', 'testing')) {
            $response['_debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    public function me(Request $request)
    {
        BookingController::autoReleaseExpiredBookings();
        return response()->json($request->user());
    }
}
