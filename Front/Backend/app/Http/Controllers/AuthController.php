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
    /**
     * Mendaftarkan akun pengguna baru (penyewa).
     * Memvalidasi format input, memblokir domain email disposable/sementara,
     * meng-generate 6-digit OTP aman, dan mengirimkan email verifikasi.
     */
    public function register(Request $request)
    {
        // 1. Validasi input: Nama (hanya huruf & spasi), Email (wajib unik), Password (min 8 karakter + simbol), No HP (format regex)
        $request->validate([
            'name'     => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->symbols()],
            'phone'    => ['required', 'string', 'regex:/^\+?[0-9]{9,15}$/'],
        ], [
            'name.regex'  => 'Nama lengkap hanya boleh mengandung huruf dan spasi.',
            'phone.regex' => 'Format nomor HP tidak valid. Hanya menerima angka (contoh: 08xxxxx atau +62xxxxx) dengan panjang 9-15 digit.',
        ]);

        // 2. Daftar domain email sementara (disposable) yang diblokir untuk pendaftaran
        $disposableDomains = [
            'mailinator.com', 'yopmail.com', '10minutemail.com', 'temp-mail.org', 
            'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com', 
            'maildrop.cc', 'mintemail.com', 'throwawaymail.com', 'tempmail.com', 
            'emailondash.com', 'generator.email', 'tempr.email', 'mailnesia.com', 'mailcatch.com'
        ];

        // 3. Memeriksa domain email pengguna yang mencoba melakukan pendaftaran
        $email = $request->email;
        $domain = substr(strrchr($email, "@"), 1);

        if (in_array(strtolower($domain), $disposableDomains)) {
            throw ValidationException::withMessages([
                'email' => ['Pendaftaran gagal. Email menggunakan domain temporary/disposable yang tidak diizinkan.'],
            ]);
        }

        // 4. Generate 6-digit OTP kriptografis aman dan atur waktu kedaluwarsa 15 menit
        $otp = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        // 5. Menyimpan data user baru ke database (status email_verified_at masih null)
        $user = User::create([
            'name'                        => $request->name,
            'email'                       => $request->email,
            'password'                    => Hash::make($request->password),
            'phone'                       => $request->phone,
            'verification_otp'            => $otp,
            'verification_otp_expires_at' => $expiresAt,
            'email_verified_at'           => null,
        ]);

        // 6. Mengirim kode OTP ke alamat email terdaftar menggunakan Mailable class
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SendOTPMail($otp, $user->name));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email OTP: " . $e->getMessage());
        }

        $response = [
            'message' => 'Registrasi berhasil. Silakan verifikasi akun Anda.',
            'email'   => $user->email,
        ];

        if (app()->environment('local', 'testing')) {
            $response['_debug_otp'] = $otp;
        }

        return response()->json($response, 201);
    }

    /**
     * Melakukan autentikasi masuk (Login) pengguna.
     * Memvalidasi kredensial, memeriksa status verifikasi email (jika belum verifikasi, kirim OTP baru),
     * melakukan pembersihan booking kedaluwarsa, dan membuat token akses Sanctum.
     */
    public function login(Request $request)
    {
        // 1. Validasi input email dan password wajib diisi
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        // 2. Melakukan percobaan login. Jika salah, lemparkan error 422
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = Auth::user();

        // 3. Jika email belum terverifikasi, paksa logout, generate OTP baru, kirim email, dan kembalikan error status
        if (is_null($user->email_verified_at)) {
            Auth::logout();

            $otp = (string) random_int(100000, 999999);
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

            if (app()->environment('local', 'testing')) {
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

    /**
     * Memverifikasi kode OTP pendaftaran pengguna.
     * Jika OTP benar dan belum kedaluwarsa (15 menit), email ditandai sebagai terverifikasi.
     */
    public function verify(Request $request)
    {
        // 1. Memeriksa kecocokan data input: email terdaftar dan OTP wajib diisi
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        // 2. Jika kode OTP tidak sama dengan yang dikirimkan, lemparkan error
        if ((string) $user->verification_otp !== (string) $request->otp) {
            throw ValidationException::withMessages([
                'otp' => ['Kode OTP salah.'],
            ]);
        }

        // 3. Jika kode OTP telah kedaluwarsa, lemparkan error
        if (now()->greaterThan($user->verification_otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Kode OTP telah kadaluwarsa.'],
            ]);
        }

        // 4. Update status email_verified_at dan hapus token OTP dari DB
        $user->update([
            'email_verified_at'           => now(),
            'verification_otp'            => null,
            'verification_otp_expires_at' => null,
        ]);

        // 5. Buat token akses baru menggunakan Laravel Sanctum untuk langsung login otomatis
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Akun berhasil diverifikasi.',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    /**
     * Mengirim ulang kode OTP verifikasi baru untuk akun yang belum terverifikasi.
     */
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

        $otp = (string) random_int(100000, 999999);
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

        if (app()->environment('local', 'testing')) {
            $response['_debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Mengeluarkan pengguna (Logout) dan menghapus token Sanctum yang digunakan saat ini.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Mengambil informasi data diri pengguna yang sedang login.
     * Membantu sinkronisasi booking kedaluwarsa secara berkala.
     */
    public function me(Request $request)
    {
        BookingController::autoReleaseExpiredBookings();
        return response()->json($request->user());
    }

    /**
     * FUNGSI: Mengirimkan kode OTP Lupa Password.
     * KEGUNAAN: Fungsi ini dipanggil saat penyewa memasukkan email di halaman lupa password.
     *           Fungsi ini akan memvalidasi apakah email terdaftar, meng-generate 6-digit OTP acak,
     *           menyimpan OTP dan masa berlakunya ke DB, lalu mengirimkannya lewat Email.
     */
    public function forgotPassword(Request $request)
    {
        // 1. Validasi input email agar berformat email yang benar
        $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        // 2. Cari data user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // Jika email tidak terdaftar, lemparkan error validasi
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Alamat email tidak ditemukan.'],
            ]);
        }

        // 3. Generate 6-digit OTP acak dan simpan ke database dengan masa kedaluwarsa 15 menit
        $otp = (string) random_int(100000, 999999);
        $user->update([
            'verification_otp' => $otp,
            'verification_otp_expires_at' => now()->addMinutes(15),
        ]);

        // 4. Kirim email OTP menggunakan template SendResetPasswordOTPMail
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SendResetPasswordOTPMail($otp, $user->name));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email OTP Reset Password: " . $e->getMessage());
        }

        $response = [
            'message' => 'Kode OTP reset password telah dikirim ke email Anda.',
            'email' => $user->email,
        ];

        // Jika dalam mode debug/lokal, lampirkan OTP di response untuk mempermudah testing
        if (app()->environment('local', 'testing')) {
            $response['_debug_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * FUNGSI: Mereset password lama menjadi password baru.
     * KEGUNAAN: Fungsi ini dipanggil setelah pengguna mengisi kode OTP, password baru, dan konfirmasi password baru.
     *           Fungsi ini memverifikasi kecocokan OTP, memeriksa masa berlaku OTP, memvalidasi aturan kekuatan sandi baru,
     *           lahu meng-hash password baru dan menyimpannya ke database.
     */
    public function resetPassword(Request $request)
    {
        // 1. Validasi input: email wajib, OTP harus 6 digit, password harus kuat (min 8 karakter, ada huruf besar/kecil & simbol)
        $request->validate([
            'email'    => 'required|string|email|max:255',
            'otp'      => 'required|string|size:6',
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->symbols()],
        ]);

        // 2. Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Alamat email tidak ditemukan.'],
            ]);
        }

        // 3. Verifikasi OTP (lakukan casting string agar tipe data cocok) dan cek masa kedaluwarsa
        if (is_null($user->verification_otp) || 
            (string) $user->verification_otp !== (string) $request->otp || 
            now()->greaterThan($user->verification_otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['Kode OTP salah atau sudah kedaluwarsa.'],
            ]);
        }

        // 4. Update password baru (di-hash menggunakan bcrypt), hapus OTP di DB, dan verifikasi email secara otomatis
        $user->update([
            'password' => Hash::make($request->password),
            'verification_otp' => null,
            'verification_otp_expires_at' => null,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ]);

        return response()->json([
            'message' => 'Password Anda berhasil diperbarui. Silakan login kembali.',
        ]);
    }

    /**
     * Autentikasi masuk atau pendaftaran otomatis menggunakan Google ID Token (OAuth).
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        // Verifikasi ID Token langsung ke server autentikasi Google
        $response = \Illuminate\Support\Facades\Http::get("https://oauth2.googleapis.com/tokeninfo?id_token=" . $request->token);

        if (!$response->successful()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'token' => ['Kredensial login Google tidak valid atau kedaluwarsa.'],
            ]);
        }

        $googleUser = $response->json();
        
        // Pastikan email telah diverifikasi oleh Google
        if (!isset($googleUser['email_verified']) || ($googleUser['email_verified'] !== 'true' && $googleUser['email_verified'] !== true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'token' => ['Alamat email Google Anda belum terverifikasi.'],
            ]);
        }

        $email = $googleUser['email'];

        // Cari atau daftarkan user baru dengan role default 'user'
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'              => $googleUser['name'],
                'password'          => Hash::make(\Illuminate\Support\Str::random(24)),
                'phone'             => '—',
                'email_verified_at' => now(),
            ]
        );

        // Buat Sanctum access token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }
}
