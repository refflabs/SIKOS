import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, MapPin } from 'lucide-react'
import { CONTACT_WHATSAPP } from '../../constants'

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

  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-8">
      {/* FAQ accordion */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Pusat Bantuan (FAQs)</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Jawaban dari pertanyaan yang paling sering ditanyakan oleh calon maupun penghuni kost.
          </p>
        </div>

        <div className="px-6" style={{ divideColor: 'var(--border)' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.q} style={{ borderBottom: index < FAQS.length - 1 ? '1px solid var(--border)' : 'none' }} className="py-4">
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between text-left text-sm py-1 cursor-pointer transition-colors duration-200"
                  style={{ color: isOpen ? '#6b8f71' : 'var(--foreground)', fontWeight: isOpen ? '600' : '500' }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.color = '#6b8f71' }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.color = 'var(--foreground)' }}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 shrink-0" style={{ color: '#6b8f71' }} />
                    {faq.q}
                  </span>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    : <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />}
                </button>
                {isOpen && (
                  <div
                    className="mt-3 pl-6 text-xs leading-relaxed"
                    style={{ color: 'var(--muted-foreground)', animation: 'fadeIn 0.18s ease' }}
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
        <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold text-sm mb-5" style={{ color: 'var(--foreground)' }}>Kontak Pengelola</h3>
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
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--muted-foreground)' }}>WhatsApp</p>
                <a
                  href={`https://wa.me/${CONTACT_WHATSAPP}?text=Halo%20Pak%20RT,%20saya%20butuh%20bantuan%20terkait%20kost.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold transition-colors duration-200"
                  style={{ color: '#6b8f71' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b8f71'}
                >
                  +62 812-3456-7890
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(107,143,113,0.1)', color: '#6b8f71' }}
              >
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Email</p>
                <a
                  href="mailto:sikostpakrt@gmail.com"
                  className="text-xs font-semibold transition-colors duration-200"
                  style={{ color: '#6b8f71' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b8f71'}
                >
                  sikostpakrt@gmail.com
                </a>
              </div>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(107,143,113,0.1)', color: '#6b8f71' }}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Lokasi Kost</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>
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
