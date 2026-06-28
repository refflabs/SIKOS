import { useState } from 'react'
import { Search } from 'lucide-react'
import { ListingCard } from '../components/ListingCard'
import { useRoomsQuery } from '../../hooks/queries'
import { useTheme } from '../../context/ThemeContext'
import { ListingGridSkeleton } from '../../components/skeletons/ListingCardSkeleton'
import { QueryError } from '../../components/QueryError'

export function RoomsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = isDark
    ? { bg: '#120d08', card: '#1d1409', border: '#3a2a18', text: '#E1DCC9', muted: '#8a7060', input: '#2a1d0f' }
    : { bg: '#F7F4EE', card: '#FDFCF9', border: '#D8D0BE', text: '#1F150C', muted: '#7a6247', input: '#F7F4EE' }

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

  const inputStyle = {
    background: D.input,
    border: `1.5px solid ${D.border}`,
    color: D.text,
    borderRadius: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div className="pb-16" style={{ background: D.bg }}>
      {/* Page intro */}
      <div className="container-app pt-8 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: '#B0BA99' }}>Katalog</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2" style={{ color: D.text }}>
          Daftar Kamar
        </h1>
        <p className="text-sm" style={{ color: D.muted }}>
          {isLoading
            ? 'Memuat…'
            : searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
            ? `${filtered.length} kamar ditemukan`
            : `${rooms.length} kamar tersedia`}
        </p>
      </div>

      {/* Sticky search bar */}
      <div
        className="sticky top-14 sm:top-16 z-20 backdrop-blur-md"
        style={{ background: isDark ? 'rgba(18,13,8,0.96)' : 'rgba(247,244,238,0.96)', borderBottom: `1px solid ${D.border}`, borderTop: `1px solid ${D.border}` }}
      >
        <div className="container-app py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: D.muted }} />
              <input
                type="text"
                placeholder="Cari nama kamar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                onFocus={e => e.currentTarget.style.borderColor = '#B0BA99'}
                onBlur={e => e.currentTarget.style.borderColor = D.border}
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ ...inputStyle, width: '8rem', padding: '0.625rem 0.75rem', cursor: 'pointer' }}
                onFocus={e => e.currentTarget.style.borderColor = '#B0BA99'}
                onBlur={e => e.currentTarget.style.borderColor = D.border}
              >
                <option value="all">Semua tipe</option>
                <option value="kosongan">Kosongan</option>
                <option value="fasilitas">Fasilitas (Isian)</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ ...inputStyle, width: '9.5rem', padding: '0.625rem 0.75rem', cursor: 'pointer' }}
                onFocus={e => e.currentTarget.style.borderColor = '#B0BA99'}
                onBlur={e => e.currentTarget.style.borderColor = D.border}
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
          <div
            className="text-center py-20 rounded-3xl"
            style={{ border: `1.5px dashed ${D.border}`, background: D.card }}
          >
            <p className="text-sm" style={{ color: D.muted }}>Tidak ada kamar yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured && (
              <div className="md:col-span-2 lg:row-span-2">
                <div
                  className="h-full rounded-3xl p-4"
                  style={{ background: D.card, border: `1px solid ${D.border}`, boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(31,21,12,0.06)' }}
                >
                  <ListingCard room={featured} featured ctaStyle="primary" />
                </div>
              </div>
            )}
            {rest.map((room) => (
              <div
                key={room.id}
                className="rounded-3xl p-3 transition-all duration-300"
                style={{
                  background: D.card,
                  border: `1px solid ${D.border}`,
                  boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(31,21,12,0.06)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(31,21,12,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(31,21,12,0.06)' }}
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
