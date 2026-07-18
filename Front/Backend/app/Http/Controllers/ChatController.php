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

        $hfToken = env('HUGGINGFACE_TOKEN');
        
        $systemPrompt = "Anda adalah 'Asisten AI Kost Pak RT', asisten virtual pintar dan ramah untuk SIKOS (Sistem Informasi Kost Syariah) di Pekanbaru.
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
- Kontak Pengelola (Pak RT): WhatsApp +62 812-3456-7890.

Jawablah pertanyaan user dengan mengacu pada informasi di atas secara singkat, padat, dan bersahabat. Jangan mengarang informasi di luar data di atas.";

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
            ->post('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions', [
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
            }
        } catch (\Throwable $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());
        }

        // Fallback: Jika HuggingFace gagal atau timeout, gunakan pencarian kata kunci cerdas secara lokal
        $lastMessage = end($request->messages)['content'];
        $fallbackReply = $this->findLocalResponse($lastMessage);

        return response()->json([
            'reply' => $fallbackReply,
            'source' => 'local_kb'
        ]);
    }

    /**
     * Pencarian berbasis kata kunci lokal sebagai fallback jika API AI offline.
     */
    private function findLocalResponse($input)
    {
        $text = strtolower($input);
        
        if (str_contains($text, 'harga') || str_contains($text, 'biaya') || str_contains($text, 'sewa') || str_contains($text, 'berapa')) {
            return "Harga kamar bervariasi sesuai tipe:\n• Tipe Kosongan: mulai Rp 500.000/bulan\n• Tipe Isian (lengkap): mulai Rp 750.000/bulan.\nSilakan cek tab 'Cari Kost' untuk info detail.";
        }
        if (str_contains($text, 'fasilitas') || str_contains($text, 'wifi') || str_contains($text, 'kamar mandi')) {
            return "Fasilitas standar setiap kamar di Kost Pak RT meliputi:\n• Kamar mandi dalam\n• WiFi gratis cepat\n• Air bersih & listrik gratis\n• Lemari pakaian & meja belajar.";
        }
        if (str_contains($text, 'lokasi') || str_contains($text, 'alamat') || str_contains($text, 'jalan') || str_contains($text, 'dimana')) {
            return "Lokasi Kost Pak RT:\nJl. Letjend. S.Parman, Gg. Al-Khalish No.18A, Cinta Raja, Sail, Kota Pekanbaru, Riau 28127. Dekat dengan kampus-kampus di Pekanbaru.";
        }
        if (str_contains($text, 'booking') || str_contains($text, 'pesan') || str_contains($text, 'cara')) {
            return "Cara booking kamar kost:\n1. Pilih kamar di tab 'Cari Kost'.\n2. Klik 'Booking Sekarang'.\n3. Isi form pemesanan.\n4. Bayar via transfer dan unggah buktinya di tab 'Histori Pembayaran'.";
        }
        
        return "Halo! Saya adalah Asisten AI Kost Pak RT. Maaf, saat ini koneksi AI saya sedang sibuk. Silakan tanyakan hal seputar harga kamar, fasilitas, lokasi, atau cara booking, atau Anda bisa beralih chat ke Pemilik Kost (Pak RT) langsung melalui tombol di atas.";
    }
}
