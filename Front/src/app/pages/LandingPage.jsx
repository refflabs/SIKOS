import { ArrowRight, Shield, Wifi, MapPin, Star, Users, Home, CheckCircle, Search, Calendar, Key } from 'lucide-react'
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
/* ─── Main Component ─── */
export function LandingPage({ search = '' }) {
  const activeTab = new URLSearchParams(search).get('tab')
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
        <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>{tabTitle}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Halaman khusus panel akun {user.name}.</p>
        </div>
        {renderTabContent()}
      </div>
    )
  }

  const { data, isLoading, isError, refetch } = useRoomsQuery()
  const rooms = Array.isArray(data) ? data : []
  const availableRooms = rooms.filter(isRoomAvailable)
  const featuredRooms = availableRooms.slice(0, 3)

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ═══════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, var(--secondary) 0%, var(--background) 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 -left-16 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c79a63 0%, transparent 70%)' }}
        />

        <div className="container-app relative z-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left – copy */}
            <div className="space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#c79a63]/10 text-[#c79a63] border border-[#c79a63]/20">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
                Kost Syariah Pekanbaru, Riau
              </div>

              <h1
                className="text-[2.2rem] sm:text-[3rem] lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.08] text-foreground"
              >
                Temukan kost{' '}
                <span
                  className="relative inline-block text-[#c79a63]"
                >
                  nyaman
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    height="6" viewBox="0 0 200 6" fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <path d="M0 4 Q50 0 100 4 Q150 8 200 4" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  </svg>
                </span>{' '}
                yang sesuai kebutuhan Anda
              </h1>

              <p className="text-base leading-relaxed max-w-md text-muted-foreground">
                Cari kamar, booking dengan mudah, dan komunikasi langsung dengan pengelola kost — semua dalam satu platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="/rooms">
                  <button
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary), #56745c)',
                      color: '#ffffff',
                      boxShadow: '0 4px 20px rgba(107,143,113,0.3)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(107,143,113,0.4)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(107,143,113,0.3)' }}
                  >
                    <Search className="h-4 w-4" />
                    Cari Kost Sekarang
                  </button>
                </a>
                <a href="/register">
                  <button
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer text-[#c79a63] border border-[#c79a63] bg-transparent"
                    onMouseEnter={e => { e.currentTarget.style.background = '#c79a63'; e.currentTarget.style.color = '#ffffff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c79a63' }}
                  >
                    Daftar Gratis <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 pt-2">
                {STATS.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold leading-none text-foreground">{value}</p>
                      <p className="text-[10px] leading-tight mt-0.5 text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – photo mosaic */}
            <div className="relative grid grid-cols-2 gap-3">
              {/* Big image */}
              <div className="col-span-2 rounded-3xl overflow-hidden aspect-[16/10] shadow-xl"
                style={{ border: '2px solid rgba(255,255,255,0.7)' }}>
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                  alt="Tampak Depan Kost"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-md"
                style={{ border: '2px solid rgba(255,255,255,0.6)' }}>
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80"
                  alt="Interior Kamar"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square shadow-md"
                style={{ border: '2px solid rgba(255,255,255,0.6)' }}>
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80"
                  alt="Ruang Bersama"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Floating review badge */}
              <div
                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 bg-card/95 border border-border backdrop-blur-md"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#6b8f71,#56745c)' }}>
                  <Star className="h-5 w-5 text-white fill-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none text-foreground">4.9 / 5.0</p>
                  <p className="text-[10px] mt-0.5 text-muted-foreground">200+ ulasan penghuni</p>
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 text-primary">
            Mengapa Pilih Kami
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Hunian yang lebih dari sekadar kamar
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group flex flex-col gap-5 p-7 rounded-3xl cursor-default transition-all duration-300 shadow-sm bg-card border border-border hover:border-primary hover:shadow-lg hover:-translate-y-1"
            >
              <span
                className="h-14 w-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 transition-all duration-300"
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <h3 className="font-bold text-base mb-2 text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED ROOMS
      ═══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, var(--secondary) 0%, var(--background) 100%)' }} className="py-20">
        <div className="container-app">
          <div className="flex items-end justify-between pb-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 text-primary">
                Rekomendasi Terbaik
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Kamar Pilihan Terbaik Untuk Anda
              </h2>
            </div>
            <a
              href="/rooms"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer text-[#c79a63] hover:text-primary"
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
              className="text-center py-16 rounded-3xl border border-dashed border-border bg-card"
            >
              <p className="text-sm mb-4 text-muted-foreground">Maaf, saat ini seluruh kamar sedang terisi penuh.</p>
              <a href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20apakah%20ada%20daftar%20tunggu%20untuk%20kamar%20kost?">
                <button
                  className="px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer hover:opacity-95 active:scale-95"
                  style={{
                    background: '#c79a63',
                    color: '#ffffff',
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
                  className="rounded-3xl overflow-hidden transition-all duration-300 shadow-sm bg-card border border-border hover:border-primary hover:shadow-lg hover:-translate-y-1"
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 text-primary">
            Cara Kerja
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Booking kost semudah pesan hotel
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Cari Kamar', desc: 'Telusuri daftar kamar yang tersedia dengan filter yang mudah.', icon: Search },
            { step: '02', title: 'Pilih & Detail', desc: 'Lihat foto, fasilitas, harga, dan lokasi secara lengkap.', icon: Home },
            { step: '03', title: 'Booking Online', desc: 'Isi formulir pemesanan dan konfirmasi dalam hitungan menit.', icon: Calendar },
            { step: '04', title: 'Check-in', desc: 'Datang ke lokasi dengan bukti booking dan mulai menghuni.', icon: Key },
          ].map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="relative p-7 rounded-3xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 cursor-pointer group bg-card border border-border hover:border-primary"
            >
              {/* Decorative Watermark Number */}
              <div
                className="absolute top-6 right-6 text-5xl font-black select-none pointer-events-none transition-all duration-300 group-hover:scale-110 text-foreground/10"
              >
                {step}
              </div>

              {/* Icon Container */}
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 bg-primary/10 border border-primary/20 text-primary"
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="font-bold text-sm mb-1.5 transition-colors duration-200 group-hover:text-primary text-foreground">
                {title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {desc}
              </p>
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
            background: 'linear-gradient(135deg, #6b8f71 0%, #56745c 100%)',
            boxShadow: '0 20px 60px rgba(107,143,113,0.18)',
          }}
        >
          {/* Decorative */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#ffffff' }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#ffffff' }}
          />

          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3 opacity-80"
            style={{ color: '#ffffff' }}>
            Mulai Sekarang
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 leading-tight"
            style={{ color: '#ffffff' }}>
            Temukan hunian impian Anda<br />bersama Kost Pak RT
          </h2>
          <p className="text-sm max-w-md mx-auto mb-8 opacity-95"
            style={{ color: '#f0f4ee' }}>
            Bergabung dengan ratusan penghuni yang sudah merasakan kenyamanan tinggal bersama kami.
          </p>
          <a href="/rooms">
            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer"
              style={{ background: '#c79a63', color: '#ffffff', boxShadow: '0 4px 20px rgba(199,154,99,0.3)' }}
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
