import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, MapPin } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

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
    a: 'Anda dapat melaporkan segala kerusakan atau keluhan fasilitas dengan langsung menghubungi pengelola via tombol WhatsApp di tab "Booking Saya" atau melalui info kontak di bawah.',
  },
  {
    q: 'Apakah ada ketentuan khusus kost syariah?',
    a: 'Ya, demi kenyamanan bersama, Kost Pak RT menerapkan aturan syariah. Tamu lawan jenis non-muhrim dilarang masuk ke dalam kamar hunian. Area ruang tamu bersama tersedia di lobi.',
  },
]

export function HelpCenter() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = { bg: '#F7F4E8', card: '#FDFCF9', header: '#f5f0e8', border: '#D8D0BE', text: '#3A342E', muted: '#7a6247', hover: '#f0ebe0' }

  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-8">
      {/* FAQ accordion */}
      <div className="rounded-3xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <div className="px-6 py-5" style={{ borderBottom: `1px solid ${D.border}`, background: D.header }}>
          <h2 className="text-lg font-bold" style={{ color: D.text }}>Pusat Bantuan (FAQs)</h2>
          <p className="text-xs mt-1" style={{ color: D.muted }}>
            Jawaban dari pertanyaan yang paling sering ditanyakan oleh calon maupun penghuni kost.
          </p>
        </div>

        <div className="px-6" style={{ divideColor: D.border }}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.q} style={{ borderBottom: index < FAQS.length - 1 ? `1px solid ${D.border}` : 'none' }} className="py-4">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left text-sm py-1 cursor-pointer transition-colors duration-200"
                  style={{ color: isOpen ? '#B0BA99' : D.text, fontWeight: isOpen ? '600' : '500' }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.color = '#B0BA99' }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = D.text }}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 shrink-0" style={{ color: '#B0BA99' }} />
                    {faq.q}
                  </span>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: D.muted }} />
                    : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: D.muted }} />}
                </button>
                {isOpen && (
                  <div
                    className="mt-3 pl-6 text-xs leading-relaxed"
                    style={{ color: D.muted, animation: 'fadeIn 0.18s ease' }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact card */}
      <div>
        <div className="rounded-3xl p-6" style={{ background: D.card, border: `1px solid ${D.border}` }}>
          <h3 className="font-bold text-sm mb-5" style={{ color: D.text }}>Kontak Pengelola</h3>
          <div className="space-y-5">

            {/* WhatsApp */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}
              >
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: D.muted }}>WhatsApp</p>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold transition-colors duration-200"
                  style={{ color: '#B0BA99' }}
                  onMouseEnter={e => e.currentTarget.style.color = D.text}
                  onMouseLeave={e => e.currentTarget.style.color = '#B0BA99'}
                >
                  +62 812-3456-7890
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: isDark ? 'rgba(91,127,166,0.15)' : 'rgba(91,127,166,0.1)', color: '#5b7fa6' }}
              >
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: D.muted }}>Email</p>
                <a
                  href="mailto:support@kostpakrt.com"
                  className="text-xs font-semibold transition-colors duration-200"
                  style={{ color: '#B0BA99' }}
                  onMouseEnter={e => e.currentTarget.style.color = D.text}
                  onMouseLeave={e => e.currentTarget.style.color = '#B0BA99'}
                >
                  support@kostpakrt.com
                </a>
              </div>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: isDark ? 'rgba(176,186,153,0.12)' : 'rgba(176,186,153,0.2)', color: '#B0BA99' }}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: D.muted }}>Lokasi Kost</p>
                <p className="text-xs leading-relaxed" style={{ color: D.text }}>
                  Jl. Letjend. S.Parman, Gg. Al-Khalish No.18A<br />
                  Cinta Raja, Sail, Kota Pekanbaru, Riau 28127
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
