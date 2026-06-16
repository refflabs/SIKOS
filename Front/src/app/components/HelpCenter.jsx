import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, MapPin } from 'lucide-react'

const FAQS = [
  {
    q: 'Bagaimana cara menyewa kamar?',
    a: 'Pilih menu "Cari Kamar", klik kamar yang Anda minati, lalu klik tombol "Booking sekarang". Jika belum masuk log, lengkapi tanggal mulai, durasi sewa, serta buat kata sandi akun Anda pada formulir yang tersedia.',
  },
  {
    q: 'Apa saja metode pembayaran kost?',
    a: 'Pembayaran dapat dilakukan melalui transfer bank atau tunai langsung ke pengelola. Setelah pengajuan booking disetujui oleh admin, detail nomor rekening pembayaran akan diinformasikan secara langsung.',
  },
  {
    q: 'Bagaimana cara melaporkan kendala fasilitas kamar?',
    a: 'Anda dapat melaporkan segala kerusakan atau keluhan fasilitas dengan langsung menghubungi pengelola via tombol WhatsApp di tab "My Booking" atau melalui info kontak di bawah.',
  },
  {
    q: 'Apakah ada ketentuan khusus kost syariah?',
    a: 'Ya, demi kenyamanan bersama, Kost Pak RT menerapkan aturan syariah. Tamu lawan jenis non-muhrim dilarang masuk ke dalam kamar hunian. Area ruang tamu bersama tersedia di lobi.',
  },
]

export function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-8">
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border bg-stone-50/50">
          <h2 className="text-lg font-bold text-foreground">Pusat Bantuan (FAQs)</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Jawaban dari pertanyaan yang paling sering ditanyakan oleh calon maupun penghuni kost.
          </p>
        </div>

        <div className="divide-y divide-border px-6">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.q} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between text-left font-medium text-sm text-foreground hover:text-teal-700 transition-colors py-1"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-muted-foreground/80 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-3 pl-6.5 text-xs text-muted-foreground leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-bold text-sm text-foreground mb-4">Kontak Pengelola</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-[#25D366] shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">WhatsApp</p>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold hover:underline text-teal-700"
                >
                  +62 812-3456-7890
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Email</p>
                <a
                  href="mailto:support@kostpakrt.com"
                  className="text-xs font-semibold hover:underline text-teal-700"
                >
                  support@kostpakrt.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-stone-500 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Lokasi Kost</p>
                <p className="text-xs text-foreground">
                  Jakarta Selatan, Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
