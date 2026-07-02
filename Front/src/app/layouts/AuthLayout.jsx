import { Building2, ArrowLeft } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const QUOTES = [
  { text: 'Hunian nyaman dimulai dari pilihan yang tepat.', author: 'Pak RT' },
  { text: 'Kost kami bukan sekadar tempat tidur, tapi rumah kedua Anda.', author: 'Kost Pak RT' },
  { text: 'Lokasi strategis, fasilitas lengkap, harga terjangkau.', author: 'Kost Pak RT' },
]
const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

export function AuthLayout({ children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ══ LEFT — always-dark brand panel ══ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #6b8f71 0%, #2f3a34 60%, #1c2420 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: '#f8f7f2' }}>Kost Pak RT</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Hunian Syariah Pekanbaru</p>
          </div>
        </div>

        {/* Visual area */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <p
            className="text-[80px] xl:text-[100px] font-black leading-none select-none mb-6"
            style={{ color: '#faf8f5', opacity: 0.08, letterSpacing: '-0.04em' }}
          >
            KOST
          </p>
          <div
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              maxHeight: '260px',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
              alt="Kost Pak RT"
              className="w-full h-full object-cover"
              style={{ maxHeight: '260px' }}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: 'Kamar', value: '12+' },
              { label: 'Penghuni', value: '200+' },
              { label: 'Rating', value: '4.9★' },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex-1 rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="text-base font-extrabold leading-none" style={{ color: '#f8f7f2' }}>{value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.9)' }}>
            "{randomQuote.text}"
          </p>
          <p className="text-[11px] mt-2 font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            — {randomQuote.author}
          </p>
        </div>
      </div>

      {/* ══ RIGHT — theme-aware form panel ══ */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-colors duration-300"
        style={{ background: 'var(--background)' }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          {/* Mobile logo */}
          <a href="/" className="flex items-center gap-2 lg:hidden">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'var(--primary)' }}
            >
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Kost Pak RT</span>
          </a>
          <div className="hidden lg:block" />

          {/* Back button */}
          <a
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 border"
            style={{
              color: 'var(--foreground)',
              background: 'var(--secondary)',
              borderColor: 'var(--border)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--foreground)'
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </a>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div
            className="w-full max-w-[420px] rounded-2xl p-8 sm:p-10 transition-colors duration-300"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="px-6 py-5 text-center text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          © {new Date().getFullYear()} Kost Pak RT · Pekanbaru, Riau
        </p>
      </div>
    </div>
  )
}
