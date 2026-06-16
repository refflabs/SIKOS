import { ArrowRight, Shield, Wifi, MapPin } from 'lucide-react'
import { Button } from '../components/Button'
import { ListingCard } from '../components/ListingCard'
import { useRoomsQuery } from '../../hooks/queries'
import { isRoomAvailable } from '../../api/roomUtils'
import { ListingGridSkeleton } from '../../components/skeletons/ListingCardSkeleton'
import { QueryError } from '../../components/QueryError'
import { useAuth } from '../../context/AuthContext'
import { BookingHistory } from '../components/BookingHistory'
import { ProfileView } from '../components/ProfileView'
import { HelpCenter } from '../components/HelpCenter'

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

export function LandingPage({ search = '' }) {
  const activeTab = new URLSearchParams(search).get('tab')
  const { user } = useAuth()

  const { data, isLoading, isError, refetch } = useRoomsQuery()
  const rooms = Array.isArray(data) ? data : []
  const availableRooms = rooms.filter(isRoomAvailable)
  const featuredRooms = availableRooms.slice(0, 3)

  // Switch to authenticated tab views if applicable
  if (user && activeTab) {
    const renderTabContent = () => {
      switch (activeTab) {
        case 'bookings':
          return <BookingHistory user={user} />
        case 'profile':
          return <ProfileView user={user} />
        case 'help':
          return <HelpCenter />
        default:
          return null
      }
    }

    const tabTitle =
      activeTab === 'bookings'
        ? 'Histori Booking'
        : activeTab === 'profile'
        ? 'Profil Saya'
        : 'Pusat Bantuan'

    return (
      <div className="container-app py-8 md:py-12 max-w-5xl">
        <div className="mb-8 border-b border-border pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{tabTitle}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Halaman khusus panel akun {user.name}.
          </p>
        </div>
        {renderTabContent()}
      </div>
    )
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-surface-teal border-b border-border overflow-hidden">
        <div className="container-app pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                Kost Syariah Jakarta Selatan
              </div>
              <h1 className="text-hero text-foreground">
                Temukan kost nyaman yang sesuai kebutuhan Anda
              </h1>
              <p className="text-subtitle text-base max-w-md">
                Cari kamar, booking dengan mudah, dan komunikasi langsung dengan pengelola kost.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="/rooms">
                  <Button variant="primary" size="lg">
                    Cari Kost
                  </Button>
                </a>
                <a href="/register">
                  <Button variant="outline" size="lg">
                    Daftar Sekarang
                  </Button>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-2xl overflow-hidden aspect-[16/10] shadow-md border border-white/50">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                  alt="Kost Exterior"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80"
                  alt="Kost Room"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80"
                  alt="Common Space"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container-app">
        <div className="grid md:grid-cols-3 gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                <Icon className="h-6 w-6" />
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="container-app">
        <div className="flex items-end justify-between border-b border-border pb-5 mb-8">
          <div>
            <p className="text-label mb-1.5">Rekomendasi Terbaik</p>
            <h2 className="text-section-title">Kamar Pilihan Terbaik Untuk Anda</h2>
          </div>
          <a href="/rooms" className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1 hover:underline">
            Lihat semua kamar <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {isLoading ? (
          <ListingGridSkeleton count={3} />
        ) : isError ? (
          <QueryError message="Gagal memuat rekomendasi kamar." onRetry={refetch} />
        ) : featuredRooms.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-stone-50/50">
            <p className="text-sm text-muted-foreground mb-4">Maaf, saat ini seluruh kamar kost kami sedang terisi penuh.</p>
            <a href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20apakah%20ada%20daftar%20tunggu%20untuk%20kamar%20kost?" target="_blank" rel="noopener noreferrer">
              <Button variant="primary">Hubungi Waiting List</Button>
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.id} className="rounded-xl border border-border bg-white p-3 shadow-sm hover:shadow-md transition-all duration-200">
                <ListingCard room={room} ctaStyle="outline" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
