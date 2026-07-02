import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
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

  const inputStyle = {
    background: 'var(--card)',
    border: '1.5px solid var(--border)',
    color: 'var(--foreground)',
    borderRadius: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

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

      {/* Search bar */}
      <div
        className="relative z-10"
        style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="container-app py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Cari nama kamar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6b8f71'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ ...inputStyle, width: '8rem', padding: '0.625rem 0.75rem', cursor: 'pointer' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6b8f71'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <option value="all">Semua tipe</option>
                <option value="kosongan">Kosongan</option>
                <option value="fasilitas">Fasilitas (Isian)</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ ...inputStyle, width: '9.5rem', padding: '0.625rem 0.75rem', cursor: 'pointer' }}
                onFocus={e => e.currentTarget.style.borderColor = '#6b8f71'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
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
              <div
                key={room.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 border"
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
                <ListingCard room={room} ctaStyle="subtle" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
