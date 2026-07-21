import { ArrowRight, Shield, Wifi, MapPin, Star, Users, Home, Search, Calendar, Key } from 'lucide-react'
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
import { CONTACT_WHATSAPP } from '../../constants'

/* ─── Static Data ─── */
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
  { label: 'Penghuni Puas', value: '40+', icon: Users },
  { label: 'Rating Google Maps', value: '4.8', icon: Star },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Cari Kamar', desc: 'Telusuri daftar kamar yang tersedia dengan filter yang mudah.', icon: Search },
  { step: '02', title: 'Pilih & Detail', desc: 'Lihat foto, fasilitas, harga, dan lokasi secara lengkap.', icon: Home },
  { step: '03', title: 'Booking Online', desc: 'Isi formulir pemesanan dan konfirmasi dalam hitungan menit.', icon: Calendar },
  { step: '04', title: 'Check-in', desc: 'Datang ke lokasi dengan bukti booking dan mulai menghuni.', icon: Key },
]

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
      : activeTab === 'payments' ? 'Pembayaran'
      : activeTab === 'profile' ? 'Profil Saya'
      : 'Pusat Bantuan'

    return (
      <div className="container-app py-8 md:py-12 max-w-5xl">
        <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>{tabTitle}</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Halaman khusus panel akun {user.name || 'Pengguna'}.</p>
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
        style={{ background: isDark ? 'var(--background)' : 'var(--surface-sage)' }}
      >
        {/* Subtle top border accent */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)' }}
        />

        <div className="container-app relative z-10 py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left – copy */}
            <div className="space-y-6">
              {/* Location badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  background: 'var(--accent)/10',
                  backgroundColor: isDark ? 'rgba(212,169,111,0.1)' : 'rgba(199,154,99,0.1)',
                  color: 'var(--accent)',
                  borderColor: isDark ? 'rgba(212,169,111,0.25)' : 'rgba(199,154,99,0.25)',
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--primary)' }}
                />
                Kost Syariah · Pekanbaru, Riau
              </div>

              <h1
                className="text-[2rem] sm:text-[2.7rem] lg:text-[3.1rem] font-extrabold tracking-tight leading-[1.1]"
                style={{ color: 'var(--foreground)' }}
              >
                Cari & Booking<br />
                <span style={{ color: 'var(--primary)' }}>Kost Syariah</span>{' '}
                <span style={{ color: 'var(--foreground)' }}>Terbaik</span>
              </h1>

              <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--muted-foreground)' }}>
                Temukan kamar kost syariah yang nyaman, booking dengan mudah, dan komunikasi langsung dengan pengelola — semua dalam satu platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <a href="/rooms">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
                    style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <Search className="h-4 w-4" />
                    Cari Kost Sekarang
                  </button>
                </a>
                <a href="/register">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border"
                    style={{
                      color: 'var(--accent)',
                      borderColor: 'var(--accent)',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(212,169,111,0.1)' : 'rgba(199,154,99,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    Daftar Gratis <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-6 pt-1">
                {STATS.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: isDark ? 'rgba(107,143,113,0.15)' : 'rgba(107,143,113,0.1)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-base font-extrabold leading-none" style={{ color: 'var(--foreground)' }}>{value}</p>
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – photo mosaic */}
            <div className="relative">
              {/* Main image */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '4/3',
                  border: '1.5px solid var(--border)',
                  background: 'var(--secondary)',
                }}
              >
                <img
                  src="/kost2.jpg"
                  alt="Tampak Depan Gedung Kost Pak RT"
                  className="h-full w-full object-cover"
                  loading="eager"
                  fetchpriority="high"
                  width="900"
                  height="675"
                />
              </div>

              {/* Two smaller images side by side */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3', border: '1.5px solid var(--border)', background: 'var(--secondary)' }}
                >
                  <img
                    src="/kost1.jpg"
                    alt="Halaman Kamar Lantai Bawah"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width="500"
                    height="375"
                  />
                </div>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3', border: '1.5px solid var(--border)', background: 'var(--secondary)' }}
                >
                  <img
                    src="/kost3.jpg"
                    alt="Halaman Belakang dan Area Jemur"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width="500"
                    height="375"
                  />
                </div>
              </div>

              {/* Review badge — anchored inside the mosaic, no overflow clip */}
              <div
                className="absolute top-4 right-4 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                style={{
                  background: isDark ? 'rgba(39,49,43,0.95)' : 'rgba(255,255,255,0.95)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--primary)' }}
                >
                  <Star className="h-4 w-4 text-white fill-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none" style={{ color: 'var(--foreground)' }}>4.8 / 5.0</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>40+ ulasan Google</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST / FEATURES
      ═══════════════════════════════════════════ */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Mengapa Pilih Kami</p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Hunian yang lebih dari sekadar kamar
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 p-6 rounded-2xl cursor-default transition-all duration-300 border"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span
                className="h-12 w-12 rounded-xl flex items-center justify-center"
                style={{
                  background: isDark ? 'rgba(107,143,113,0.15)' : 'rgba(107,143,113,0.1)',
                  color: 'var(--primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-bold text-[15px] mb-1.5" style={{ color: 'var(--foreground)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED ROOMS — flat background, clean card grid
      ═══════════════════════════════════════════ */}
      <section style={{ background: 'var(--surface-alt)' }} className="py-16">
        <div className="container-app">
          <div className="flex items-end justify-between pb-8">
            <div>
              <p className="section-label mb-2">Rekomendasi Terbaik</p>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                Kamar Pilihan Terbaik Untuk Anda
              </h2>
            </div>
            <a
              href="/rooms"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
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
              className="text-center py-14 rounded-2xl border border-dashed"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Maaf, saat ini seluruh kamar sedang terisi penuh.</p>
              <a href={`https://wa.me/${CONTACT_WHATSAPP}?text=Halo%20Pak%20RT,%20apakah%20ada%20daftar%20tunggu%20untuk%20kamar%20kost?`}>
                <button
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--accent)', color: '#ffffff' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = 'var(--accent-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--accent)' }}
                >
                  Hubungi Waiting List
                </button>
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredRooms.map((room) => (
                <ListingCard key={room.id} room={room} ctaStyle="outline" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SISTEM BOOKING (formerly "Cara Kerja")
      ═══════════════════════════════════════════ */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Sistem Booking</p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Proses booking yang simpel &amp; cepat
          </h2>
          <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Dari cari kamar hingga check-in, semua bisa dilakukan dalam beberapa langkah mudah.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
            <div
              key={step}
              className="relative p-6 rounded-2xl transition-all duration-300 cursor-pointer group border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                className="absolute top-5 right-5 text-4xl font-black select-none pointer-events-none transition-all duration-300"
                style={{ color: 'var(--primary)', opacity: isDark ? 0.8 : 0.6 }}
              >
                {step}
              </div>

              {/* Icon */}
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                style={{
                  background: isDark ? 'rgba(107,143,113,0.15)' : 'rgba(107,143,113,0.1)',
                  color: 'var(--primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3
                className="font-bold text-sm mb-1.5 transition-colors duration-200 group-hover:text-primary"
                style={{ color: 'var(--foreground)' }}
              >
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════ */}
      <section className="container-app pb-16">
        <div
          className="rounded-2xl p-10 md:p-12 text-center transition-all duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, var(--card) 0%, var(--background) 100%)'
              : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            border: isDark ? '1px solid var(--border)' : 'none',
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ color: isDark ? 'var(--primary)' : 'rgba(255,255,255,0.75)' }}
          >
            Mulai Sekarang
          </p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight"
            style={{ color: isDark ? 'var(--foreground)' : '#ffffff' }}
          >
            Temukan hunian impian Anda<br />bersama Kost Pak RT
          </h2>
          <p
            className="text-sm max-w-md mx-auto mb-7"
            style={{ color: isDark ? 'var(--muted-foreground)' : 'rgba(255,255,255,0.85)' }}
          >
            Bergabung dengan ratusan penghuni yang sudah merasakan kenyamanan tinggal bersama kami.
          </p>
          <a href="/rooms">
            <button
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              style={{
                background: isDark ? 'var(--primary)' : 'var(--accent)',
                color: isDark ? 'var(--primary-foreground)' : '#ffffff',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? 'var(--primary-dark)' : 'var(--accent-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? 'var(--primary)' : 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Cari Kamar Tersedia <ArrowRight className="h-4 w-4" />
            </button>
          </a>
        </div>
      </section>

    </div>
  )
}
