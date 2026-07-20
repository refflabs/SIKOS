import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { ListingCard } from '../components/ListingCard'
import { EmptyState } from '../components/EmptyState'
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

  return (
    <div className="pb-16" style={{ background: 'transparent' }}>
      {/* Page intro */}
      <div className="container-app pt-8 pb-6">
        <p className="section-label mb-2">Katalog</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
          Daftar Kamar
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {isLoading
            ? 'Memuat…'
            : searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
            ? `${filtered.length} kamar ditemukan`
            : `${rooms.length} kamar tersedia`}
        </p>
      </div>

      {/* Search & Filter Card */}
      <div className="container-app mb-6 relative z-10">
        <div
          className="p-4 sm:p-5 rounded-2xl border transition-all duration-300"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="w-full md:flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Cari nama kamar atau deskripsi…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none border"
                style={{
                  background: 'var(--secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,143,113,0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Type Select */}
              <div className="relative w-full sm:w-44">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl text-sm transition-all duration-200 outline-none border appearance-none cursor-pointer"
                  style={{
                    background: 'var(--secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,143,113,0.15)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Semua tipe</option>
                  <option value="kosongan">Kosongan</option>
                  <option value="fasilitas">Fasilitas (Isian)</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              </div>

              {/* Status Select */}
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl text-sm transition-all duration-200 outline-none border appearance-none cursor-pointer"
                  style={{
                    background: 'var(--secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,143,113,0.15)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">Semua status</option>
                  <option value="available">Tersedia</option>
                  <option value="booked">Terisi</option>
                  <option value="maintenance">Perawatan</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-app py-8">
        {isLoading ? (
          <ListingGridSkeleton count={7} featured />
        ) : isError ? (
          <QueryError message="Gagal memuat kamar. Periksa koneksi API." onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Kamar tidak ditemukan"
            description="Tidak ada kamar yang cocok dengan pencarian atau filter yang dipilih."
            actionLabel="Reset Filter"
            actionHref="/rooms"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((room) => (
              <ListingCard key={room.id} room={room} ctaStyle="subtle" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
