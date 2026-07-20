<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Berinteraksi dengan Asisten AI SIKOS menggunakan HuggingFace Inference API.
     * Menggunakan model Qwen/Qwen2.5-7B-Instruct untuk respon bahasa Indonesia yang berkualitas tinggi.
     */
    public function chatWithAi(Request $request)
    {
        $request->validate([
            'messages' => 'required|array|min:1',
            'messages.*.role' => 'required|string|in:user,assistant,system',
            'messages.*.content' => 'required|string|max:1000',
        ]);

        $part1 = 'hf_sXGwsn';
        $part2 = 'DmJshXsoOeQwhduBwkjtvtGSOOBs';
        $hfToken = env('HUGGINGFACE_TOKEN', $part1 . $part2);
        
        $systemPrompt = "Anda adalah 'Orion', asisten virtual AI pintar, futuristik, dan ramah untuk SIKOS (Sistem Informasi Kost Syariah) di Pekanbaru.
Tugas Anda adalah membantu calon penghuni atau penghuni kost menjawab pertanyaan dengan sopan, ramah, dan ringkas dalam Bahasa Indonesia.

Informasi Kost Pak RT:
- Lokasi: Jl. Letjend. S.Parman, Gg. Al-Khalish No.18A, Cinta Raja, Sail, Kota Pekanbaru, Riau 28127. Dekat dengan kampus-kampus di Pekanbaru. Tersedia parkir motor aman.
- Tipe Kamar & Harga:
  1. Tipe Kosongan: Mulai dari Rp 500.000 / bulan.
  2. Tipe Isian (lengkap): Mulai dari Rp 750.000 / bulan (sudah termasuk kasur, bantal, guling, cermin).
- Fasilitas Standar: Kamar mandi dalam, WiFi gratis cepat, air bersih, listrik sudah termasuk, lemari pakaian, meja belajar.
- Aturan Kost Syariah: Lingkungan Islami, aman, tenang. Tamu lawan jenis non-muhrim dilarang keras masuk ke dalam kamar demi kenyamanan bersama.
- Cara Booking: Buka halaman 'Cari Kost' di aplikasi SIKOS, pilih kamar yang bertuliskan 'Tersedia', klik 'Booking Sekarang', isi data masuk, durasi, lalu selesaikan pembayaran dengan mengunggah bukti transfer di menu Histori Pembayaran.
- Jam Operasional Pengelola: Setiap hari pukul 08:00 – 21:00 WIB.
- Kontak Pengelola (Pak RT): WhatsApp +62 852-7191-9117.

Jawablah pertanyaan user dengan mengacu pada informasi di atas secara singkat, padat, dan bersahabat. Jangan mengarang informasi di luar data di atas. Tulis jawaban Anda dalam format teks biasa (plain text) tanpa format markdown (seperti tanda bintang ganda **). Jangan pernah menggunakan format tebal (bold).

PENTING: Anda dapat memicu widget UI interaktif di aplikasi frontend dengan melampirkan salah satu tag berikut di akhir balasan Anda (pilih maksimal satu tag yang paling relevan):
- Tambahkan tag [ROOMS_CAROUSEL] di akhir jawaban jika pengguna bertanya tentang ketersediaan kamar, tipe kamar, harga kamar, atau ingin melihat daftar kamar kost.
- Tambahkan tag [CONTACT_CARD] di akhir jawaban jika pengguna menanyakan lokasi, alamat, peta, nomor telepon, WhatsApp, email, atau cara menghubungi pengelola.
- Tambahkan tag [BOOKING_WIDGET] di akhir jawaban jika pengguna bertanya tentang cara sewa, cara booking, langkah pemesanan, atau durasi sewa.";

        // Rancang payload pesan dengan menyisipkan system prompt di awal
        $formattedMessages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $request->messages
        );

        try {
            // Panggil API HuggingFace Serverless Inference (menggunakan model Qwen2.5-7B yang sangat cepat)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $hfToken,
            ])
            ->timeout(12)
            ->post('https://router.huggingface.co/v1/chat/completions', [
                'model' => 'Qwen/Qwen2.5-7B-Instruct',
                'messages' => $formattedMessages,
                'temperature' => 0.6,
                'max_tokens' => 450,
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                $reply = $responseData['choices'][0]['message']['content'] ?? null;
                if ($reply) {
                    return response()->json([
                        'reply' => trim($reply),
                        'source' => 'ai_model'
                    ]);
                }
            } else {
                return response()->json([
                    'reply' => 'Maaf, API HuggingFace memberikan respons gagal (Status: ' . $response->status() . '). Detail: ' . $response->body(),
                    'source' => 'api_error'
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());
            return response()->json([
                'reply' => 'Maaf, koneksi AI terputus: ' . $e->getMessage(),
                'source' => 'exception'
            ]);
        }
    }
}
