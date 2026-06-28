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

  // Right panel tokens — light vs dark
  const R = { pageBg: '#f8f7f2', cardBg: '#ffffff', cardBorder: '#d9e2d3', cardShadow: '0 4px 24px rgba(31,21,12,0.08)' }

  const backBtn = { color: '#2f3a34', bg: 'rgba(107,143,113,0.06)', border: 'rgba(107,143,113,0.12)', hoverBg: 'rgba(107,143,113,0.12)', hoverColor: '#2f3a34' }

  const footerColor = '#2f3a34'

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ══ LEFT — dark brand panel (always dark) ══ */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #6b8f71 0%, #2f3a34 60%, #1c2420 100%)' }}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #d9e2d3 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
          style={{ background: 'radial-gradient(circle, #faf8f5 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#6b8f71,#56745c)', boxShadow: '0 4px 12px rgba(107,143,113,0.3)' }}>
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: '#f8f7f2' }}>Kost Pak RT</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#d9e2d3' }}>Hunian Syariah Pekanbaru</p>
          </div>
        </div>

        {/* Visual */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <p className="text-[80px] xl:text-[100px] font-black leading-none select-none mb-6 opacity-10"
            style={{ color: '#faf8f5', letterSpacing: '-0.04em' }}>KOST</p>
          <div className="rounded-3xl overflow-hidden mb-8 shadow-2xl"
            style={{ border: '1.5px solid rgba(107,143,113,0.2)', maxHeight: '260px' }}>
            <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80"
              alt="Kost Pak RT interior" className="w-full h-full object-cover" style={{ maxHeight: '260px' }} />
          </div>
          <div className="flex gap-4">
            {[{ label: 'Kamar', value: '12+' }, { label: 'Penghuni', value: '200+' }, { label: 'Rating', value: '4.9★' }].map(({ label, value }) => (
              <div key={label} className="flex-1 rounded-2xl p-3 text-center"
                style={{ background: 'rgba(107,143,113,0.1)', border: '1px solid rgba(107,143,113,0.15)' }}>
                <p className="text-base font-extrabold leading-none" style={{ color: '#f8f7f2' }}>{value}</p>
                <p className="text-[10px] mt-1" style={{ color: '#d9e2d3' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(107,143,113,0.08)', border: '1px solid rgba(107,143,113,0.15)' }}>
            <p className="text-sm leading-relaxed italic" style={{ color: '#faf8f5' }}>"{randomQuote.text}"</p>
            <p className="text-[11px] mt-2 font-semibold" style={{ color: '#d9e2d3' }}>— {randomQuote.author}</p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — theme-aware form panel ══ */}
      <div className="flex-1 flex flex-col min-h-screen transition-colors duration-300"
        style={{ background: R.pageBg }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          {/* Mobile logo */}
          <a href="/" className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg,#6b8f71,#56745c)' }}>
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="text-sm font-bold" style={{ color: '#2f3a34' }}>Kost Pak RT</span>
          </a>
          <div className="hidden lg:block" />

          {/* Back button */}
          <a
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200"
            style={{ color: backBtn.color, background: backBtn.bg, border: `1px solid ${backBtn.border}` }}
            onMouseEnter={e => { e.currentTarget.style.background = backBtn.hoverBg; e.currentTarget.style.color = backBtn.hoverColor }}
            onMouseLeave={e => { e.currentTarget.style.background = backBtn.bg; e.currentTarget.style.color = backBtn.color }}
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </a>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10 transition-colors duration-300"
            style={{ background: R.cardBg, border: `1px solid ${R.cardBorder}`, boxShadow: R.cardShadow }}>
            {children}
          </div>
        </div>

        {/* Footer */}
        <p className="px-6 py-5 text-center text-[11px]" style={{ color: footerColor }}>
          © {new Date().getFullYear()} Kost Pak RT · Pekanbaru, Riau
        </p>
      </div>
    </div>
  )
}
