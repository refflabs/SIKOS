import { useState } from 'react'
import { ArrowRight, Shield, Wifi, MapPin, Clock, Search } from 'lucide-react'
import { Button } from '../components/Button'
import { ListingCard } from '../components/ListingCard'
import { useRoomsQuery } from '../../hooks/queries'
import { isRoomAvailable } from '../../api/roomUtils'
import { ListingGridSkeleton } from '../../components/skeletons/ListingCardSkeleton'
import { QueryError } from '../../components/QueryError'

const TRUST_ITEMS = [
  { icon: Shield, text: 'Lingkungan syariah & aman' },
  { icon: Wifi, text: 'WiFi & fasilitas lengkap' },
  { icon: MapPin, text: 'Dekat kampus' },
  { icon: Clock, text: 'Booking 24 jam' },
]

const TYPE_CHIPS = [
  { label: 'Semua', value: 'all' },
  { label: 'Single', value: 'single' },
  { label: 'Double', value: 'double' },
  { label: 'Suite', value: 'suite' },
]

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all')

  const { data, isLoading, isError, refetch } = useRoomsQuery()
  const rooms = Array.isArray(data) ? data : []
  const available = rooms.filter(isRoomAvailable)
  const filtered = available
    .filter((r) => activeType === 'all' || r.type === activeType)
    .filter((r) => r.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  const featured = filtered.slice(0, 6)

  const handleHeroSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    window.location.href = q ? `/rooms?search=${encodeURIComponent(q)}` : '/rooms'
  }

  return (
    <div>
      {/* Hero — single band, no duplicate top bar */}
      <section className="relative border-b border-border bg-surface-teal overflow-hidden">
        <div className="container-app relative pt-8 pb-10 md:pt-12 md:pb-14">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-label mb-3 text-teal-800/80">Kost syariah · Jakarta Selatan</p>
              <h1 className="text-hero mb-4">
                Cari & sewa kost nyaman, tanpa ribet.
              </h1>
              <p className="text-subtitle max-w-md mb-6">
                Kost Pak RT — hunian modern untuk mahasiswa & pekerja. Booking langsung dari HP.
              </p>

              <form onSubmit={handleHeroSearch} className="mb-5">
                <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white rounded-2xl border border-border shadow-md">
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari nama kamar…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 py-3 text-sm bg-transparent outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="sm:shrink-0">
                    Cari kamar
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap gap-2 mb-6">
                {TYPE_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setActiveType(chip.value)}
                    className={`chip ${activeType === chip.value ? 'chip-active' : ''}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                {[
                  { v: isLoading ? '—' : rooms.length, l: 'Kamar' },
                  { v: isLoading ? '—' : available.length, l: 'Tersedia' },
                  { v: '150+', l: 'Penghuni' },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white/80 border border-border/80 px-3 py-3">
                    <p className="text-xl font-extrabold">{s.v}</p>
                    <p className="text-[11px] text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <div className="col-span-2 rounded-2xl overflow-hidden aspect-[16/9] shadow-lg border border-white/50">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                  alt="Kost"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80"
                  alt="Kamar"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-xl overflow-hidden aspect-square shadow-md relative">
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500&q=80"
                  alt="Premium"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 rounded-lg px-2 py-1.5 text-xs border border-border">
                  <span className="text-amber-600 font-semibold">Promo</span> Mulai sewa bulan ini
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-amber py-10 border-b border-border">
        <div className="container-app grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex gap-3 items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-amber-100 shadow-sm">
                <Icon className="h-5 w-5 text-amber-700" />
              </span>
              <p className="text-sm font-medium leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-label mb-2">Rekomendasi</p>
              <h2 className="text-section-title">Kamar tersedia sekarang</h2>
            </div>
            <a href="/rooms" className="text-sm font-medium text-foreground hover:underline">
              Lihat semua →
            </a>
          </div>

          {isLoading ? (
            <ListingGridSkeleton count={6} />
          ) : isError ? (
            <QueryError message="Gagal memuat kamar." onRetry={() => refetch()} />
          ) : featured.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-surface-warm border border-dashed border-border">
              <p className="text-subtitle mb-4">Belum ada kamar tersedia.</p>
              <a href="/rooms">
                <Button variant="primary">Jelajahi katalog</Button>
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((room) => (
                <ListingCard key={room.id} room={room} ctaStyle="subtle" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-surface-indigo py-14 md:py-16 border-t border-border">
        <div className="container-app flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-lg">
            <p className="text-label text-indigo-700/80 mb-2">Mulai hari ini</p>
            <h2 className="text-section-title mb-3">Siap pindah minggu ini?</h2>
            <p className="text-subtitle text-sm">
              Booking online — konfirmasi admin dalam 24 jam.
            </p>
          </div>
          <a href="/booking">
            <Button variant="primary" size="lg">
              Booking sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
