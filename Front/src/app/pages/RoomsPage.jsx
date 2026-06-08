import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { ListingCard } from '../components/ListingCard'
import { useRoomsQuery } from '../../hooks/queries'
import { ListingGridSkeleton } from '../../components/skeletons/ListingCardSkeleton'
import { QueryError } from '../../components/QueryError'

export function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('search') || ''
    }
    return ''
  })
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const params = {}
  if (selectedStatus !== 'all') params.status = selectedStatus
  if (selectedType !== 'all') params.type = selectedType

  const { data, isLoading, isError, refetch } = useRoomsQuery(params)
  const rooms = Array.isArray(data) ? data : []
  const filtered = rooms.filter((room) =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const [featured, ...rest] = filtered

  return (
    <div className="pb-16">
      {/* Seamless page intro — no second navbar */}
      <div className="container-app pt-8 pb-6">
        <p className="text-label mb-2">Katalog</p>
        <h1 className="text-hero text-2xl sm:text-3xl lg:text-4xl mb-2">Daftar kamar</h1>
        <p className="text-subtitle">
          {isLoading ? 'Memuat…' : `${filtered.length} kamar ditemukan`}
        </p>
      </div>

      <div className="sticky top-14 sm:top-16 z-20 bg-background/95 backdrop-blur-md border-y border-border">
        <div className="container-app py-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama kamar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field !w-auto min-w-[120px] py-2.5"
              >
                <option value="all">Semua tipe</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field !w-auto min-w-[130px] py-2.5"
              >
                <option value="all">Semua status</option>
                <option value="available">Tersedia</option>
                <option value="booked">Terisi</option>
                <option value="maintenance">Perawatan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {isLoading ? (
          <ListingGridSkeleton count={7} featured />
        ) : isError ? (
          <QueryError
            message="Gagal memuat kamar. Periksa koneksi API."
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-surface-warm border border-dashed border-border">
            <p className="text-subtitle">Tidak ada kamar yang cocok.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured && (
              <div className="md:col-span-2 lg:row-span-2">
                <div className="h-full rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <ListingCard room={featured} featured ctaStyle="primary" />
                </div>
              </div>
            )}
            {rest.map((room) => (
              <div key={room.id} className="rounded-xl border border-border bg-white p-3">
                <ListingCard room={room} ctaStyle="subtle" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
