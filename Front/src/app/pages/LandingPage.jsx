import { ArrowRight, Shield, Wifi, MapPin, Star, Users, Home, CheckCircle, Search } from 'lucide-react'
import { useRoomsQuery } from '../../hooks/queries'
import { isRoomAvailable } from '../../api/roomUtils'
import { ListingCard } from '../components/ListingCard'
import { ListingGridSkeleton } from '../../components/skeletons/ListingCardSkeleton'
import { QueryError } from '../../components/QueryError'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { BookingHistory } from '../components/BookingHistory'
import { PaymentHistory } from '../components/PaymentHistory'
import { ProfileView } from '../components/ProfileView'
import { HelpCenter } from '../components/HelpCenter'

/* ─── Statis Data ─── */
const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Lingkungan Syariah & Aman',
    desc: 'Hunian aman, tenteram, dan kondusif untuk studi maupun produktivitas kerja.',
  },
  {
    icon: Wifi,
    title: 'Fasilitas Kamar Lengkap',
    desc: 'Lengkap dengan kamar mandi dalam, furnitur fungsional, dan WiFi cepat gratis.',
  },
  {
    icon: MapPin,
    title: 'Lokasi Strategis & Dekat Kampus',
    desc: 'Akses mudah ke transportasi umum, area kuliner, dan kampus-kampus ternama.',
  },
]

const STATS = [
  { label: 'Kamar Tersedia', value: '12+', icon: Home },
  { label: 'Penghuni Puas', value: '200+', icon: Users },
  { label: 'Rating Rata-rata', value: '4.9', icon: Star },
]

/* ─── Palette shorthand ─── */
const C = {
  beige: '#E1DCC9',
  mocca: '#412D15',
  sage: '#B0BA99',
  coffee: '#1F150C',
  bg: '#F7F4EE',
  card: '#FDFCF9',
  muted: '#7a6247',
  border: '#D8D0BE',
}

/* ─── Main Component ─── */
export function LandingPage({ search = '' }) {
  const activeTab = new URLSearchParams(search).get('tab')
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Dynamic palette based on theme
  const C = isDark ? {
    beige:  '#E1DCC9',
    mocca:  '#B0BA99',        // sage becomes primary in dark
    sage:   '#B0BA99',
    coffee: '#E1DCC9',
    bg:     '#120d08',
    card:   '#1d1409',
    muted:  '#8a7060',
    border: '#3a2a18',
    btnText: '#120d08',
  } : {
    beige:  '#E1DCC9',
    mocca:  '#412D15',
    sage:   '#B0BA99',
    coffee: '#1F150C',
    bg:     '#F7F4EE',
    card:   '#FDFCF9',
    muted:  '#7a6247',
    border: '#D8D0BE',
    btnText: '#E1DCC9',
  }

  /* ── Tab views ── */
  if (user && activeTab) {
    const renderTabContent = () => {
      switch (activeTab) {
        case 'bookings': return <BookingHistory user={user} />
        case 'payments': return <PaymentHistory user={user} />
        case 'profile':  return <ProfileView user={user} />
        case 'help':     return <HelpCenter />
        default:         return null
      }
    }
    const tabTitle =
      activeTab === 'bookings' ? 'Histori Booking'
      : activeTab === 'payments' ? 'Histori Pembayaran'
      : activeTab === 'profile' ? 'Profil Saya'
      : 'Pusat Bantuan'

    return (
      <div className="container-app py-8 md:py-12 max-w-5xl">
        <div className="mb-8 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.coffee }}>{tabTitle}</h1>
          <p className="text-xs mt-1" style={{ color: C.muted }}>Halaman khusus panel akun {user.name}.</p>
        </div>
        {renderTabContent()}
      </div>
    )
  }

  const { data, isLoading, isError, refetch } = useRoomsQuery()
  const rooms = Array.isArray(data) ? data : []
  const availableRooms = rooms.filter(isRoomAvailable)
  const featuredRooms = availableRooms.slice(0, 3)

  /* ── Main Landing ── */
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: isDark
          ? `linear-gradient(160deg, #1d1409 0%, #120d08 55%, #1a1f14 100%)`
          : `linear-gradient(160deg, ${C.beige} 0%, ${C.bg} 55%, #f0f2ec 100%)` }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.sage} 0%, transparent 70%)` }}
        />
        <div
          className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.mocca} 0%, transparent 70%)` }}
        />

        <div className="container-app relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left – copy */}
            <div className="space-y-7">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(65,45,21,0.08)', color: C.mocca, border: `1px solid rgba(65,45,21,0.18)` }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: C.sage }} />
                Kost Syariah Pekanbaru, Riau
              </div>

              <h1
                className="text-[2.2rem] sm:text-[3rem] lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.08]"
                style={{ color: C.coffee }}
              >
                Temukan kost{' '}
                <span
                  className="relative inline-block"
                  style={{ color: C.mocca }}
                >
                  nyaman
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    height="6" viewBox="0 0 200 6" fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke={C.sage} strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </svg>
                </span>{' '}
                yang sesuai kebutuhan Anda
              </h1>

              <p className="text-base leading-relaxed max-w-md" style={{ color: C.muted }}>
                Cari kamar, booking dengan mudah, dan komunikasi langsung dengan pengelola kost — semua dalam satu platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="/rooms">
                  <button
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${C.mocca}, #2e1e0a)`,
                      color: C.beige,
                      boxShadow: `0 4px 20px rgba(65,45,21,0.35)`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(65,45,21,0.45)` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(65,45,21,0.35)` }}
                  >
                    <Search className="h-4 w-4" />
                    Cari Kost Sekarang
                  </button>
                </a>
                <a href="/register">
                  <button
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      color: C.mocca,
                      border: `1.5px solid ${C.mocca}`,
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.mocca; e.currentTarget.style.color = C.btnText }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.mocca }}
                  >
                    Daftar Gratis <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 pt-2">
                {STATS.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(176,186,153,0.25)', color: C.sage }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold leading-none" style={{ color: C.coffee }}>{value}</p>
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: C.muted }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – photo mosaic */}
            <div className="relative grid grid-cols-2 gap-3">
              {/* Big image */}
              <div className="col-span-2 rounded-3xl overflow-hidden aspect-[16/10] shadow-xl"
                style={{ border: `2px solid rgba(255,255,255,0.7)` }}>
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                  alt="Tampak Depan Kost"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-md"
                style={{ border: `2px solid rgba(255,255,255,0.6)` }}>
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80"
                  alt="Interior Kamar"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-md"
                style={{ border: `2px solid rgba(255,255,255,0.6)` }}>
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80"
                  alt="Ruang Bersama"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating review badge */}
              <div
                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3"
                style={{
                  background: 'rgba(253,252,249,0.96)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${C.sage},#8a9478)` }}>
                  <Star className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none" style={{ color: C.coffee }}>4.9 / 5.0</p>
                  <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>200+ ulasan penghuni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST / FEATURES
      ═══════════════════════════════════════════ */}
      <section className="container-app py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: C.sage }}>
            Mengapa Pilih Kami
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.coffee }}>
            Hunian yang lebih dari sekadar kamar
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group flex flex-col gap-5 p-7 rounded-3xl cursor-default transition-all duration-300"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                boxShadow: '0 2px 16px rgba(31,21,12,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(31,21,12,0.1)'
                e.currentTarget.style.borderColor = C.sage
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 16px rgba(31,21,12,0.05)'
                e.currentTarget.style.borderColor = C.border
              }}
            >
              <span
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${C.sage}22,${C.sage}44)`, color: C.mocca }}
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="font-bold text-base mb-2" style={{ color: C.coffee }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED ROOMS
      ═══════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(160deg, ${C.beige}55 0%, ${C.bg} 60%)` }} className="py-20">
        <div className="container-app">
          <div className="flex items-end justify-between pb-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: C.sage }}>
                Rekomendasi Terbaik
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.coffee }}>
                Kamar Pilihan Terbaik Untuk Anda
              </h2>
            </div>
            <a
              href="/rooms"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer"
              style={{ color: C.mocca }}
              onMouseEnter={e => e.currentTarget.style.color = C.sage}
              onMouseLeave={e => e.currentTarget.style.color = C.mocca}
            >
              Lihat semua <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {isLoading ? (
            <ListingGridSkeleton count={3} />
          ) : isError ? (
            <QueryError message="Gagal memuat rekomendasi kamar." onRetry={refetch} />
          ) : featuredRooms.length === 0 ? (
            <div
              className="text-center py-16 rounded-3xl"
              style={{ border: `1.5px dashed ${C.border}`, background: `${C.bg}` }}
            >
              <p className="text-sm mb-4" style={{ color: C.muted }}>Maaf, saat ini seluruh kamar sedang terisi penuh.</p>
              <a href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20apakah%20ada%20daftar%20tunggu%20untuk%20kamar%20kost?">
                <button
                  className="px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer hover:opacity-95 active:scale-95"
                  style={{
                    background: C.mocca,
                    color: C.btnText,
                    boxShadow: '0 4px 16px rgba(65,45,21,0.25)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(65,45,21,0.35)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(65,45,21,0.25)'
                  }}
                >
                  Hubungi Waiting List
                </button>
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <div
                  key={room.id}
                  className="rounded-3xl overflow-hidden transition-all duration-300"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 2px 16px rgba(31,21,12,0.06)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(31,21,12,0.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 16px rgba(31,21,12,0.06)'
                  }}
                >
                  <ListingCard room={room} ctaStyle="outline" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="container-app py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: C.sage }}>
            Cara Kerja
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: C.coffee }}>
            Booking kost semudah pesan hotel
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Cari Kamar', desc: 'Telusuri daftar kamar yang tersedia dengan filter yang mudah.' },
            { step: '02', title: 'Pilih & Detail', desc: 'Lihat foto, fasilitas, harga, dan lokasi secara lengkap.' },
            { step: '03', title: 'Booking Online', desc: 'Isi formulir pemesanan dan konfirmasi dalam hitungan menit.' },
            { step: '04', title: 'Check-in', desc: 'Datang ke lokasi dengan bukti booking dan mulai menghuni.' },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="relative p-7 rounded-3xl"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <p
                className="text-5xl font-black leading-none mb-4 opacity-10"
                style={{ color: C.mocca }}
              >
                {step}
              </p>
              <CheckCircle className="h-6 w-6 mb-3" style={{ color: C.sage }} />
              <h3 className="font-bold text-sm mb-1.5" style={{ color: C.coffee }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="container-app pb-20">
        <div
          className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #E1DCC9 0%, #D4C4A4 100%)'
              : 'linear-gradient(135deg, #412D15 0%, #2e1e0a 100%)',
            boxShadow: isDark
              ? '0 20px 60px rgba(225,220,201,0.15)'
              : '0 20px 60px rgba(65,45,21,0.4)',
          }}
        >
          {/* Decorative */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: isDark ? '#412D15' : C.sage }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: isDark ? '#1F150C' : C.beige }}
          />

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3 opacity-60"
            style={{ color: isDark ? '#412D15' : C.sage }}>
            Mulai Sekarang
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 leading-tight"
            style={{ color: isDark ? '#1F150C' : C.beige }}>
            Temukan hunian impian Anda<br />bersama Kost Pak RT
          </h2>
          <p className="text-sm max-w-md mx-auto mb-8 opacity-70"
            style={{ color: isDark ? '#3a2810' : C.beige }}>
            Bergabung dengan ratusan penghuni yang sudah merasakan kenyamanan tinggal bersama kami.
          </p>
          <a href="/rooms">
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
              style={
                isDark
                  ? { background: '#412D15', color: '#E1DCC9', boxShadow: '0 4px 20px rgba(65,45,21,0.35)' }
                  : { background: '#E1DCC9', color: '#1F150C', boxShadow: '0 4px 20px rgba(225,220,201,0.3)' }
              }
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
            >
              Cari Kamar Tersedia <ArrowRight className="h-4 w-4" />
            </button>
          </a>
        </div>
      </section>

    </div>
  )
}
