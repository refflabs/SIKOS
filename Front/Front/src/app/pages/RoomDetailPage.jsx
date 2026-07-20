import { Calendar, ArrowLeft } from 'lucide-react'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { LazyImage } from '../../components/LazyImage'
import { useRoomQuery } from '../../hooks/queries'
import { QueryError } from '../../components/QueryError'
import {
  formatPrice,
  isRoomAvailable,
  roomFacilities,
  roomImage,
  statusLabel,
} from '../../api/roomUtils'

function RoomDetailSkeleton() {
  return (
    <div className="container-app py-8 animate-pulse">
      <div className="h-4 w-32 rounded mb-8" style={{ background: 'var(--secondary)' }} />
      <div className="grid lg:grid-cols-2 gap-10">
        <div className="aspect-[16/10] rounded-2xl" style={{ background: 'var(--secondary)' }} />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded" style={{ background: 'var(--secondary)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'var(--secondary)' }} />
          <div className="h-4 w-3/4 rounded" style={{ background: 'var(--secondary)' }} />
          <div className="h-24 rounded" style={{ background: 'var(--secondary)' }} />
        </div>
      </div>
    </div>
  )
}

export function RoomDetailPage({ search = '' }) {
  const roomId = new URLSearchParams(search).get('id') || ''
  const { data: room, isLoading, isError, refetch } = useRoomQuery(roomId)

  if (isLoading) return <RoomDetailSkeleton />

  if (isError || !room) {
    return (
      <div className="container-app py-16">
        <QueryError message="Kamar tidak ditemukan." onRetry={() => refetch()} />
        <a href="/rooms" className="inline-block mt-6">
          <Button variant="outline">Kembali</Button>
        </a>
      </div>
    )
  }

  const facilities = roomFacilities(room)

  return (
    <div className="pb-16">
      <div className="container-app py-6">
        <a
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Daftar kamar
        </a>
      </div>

      <div className="container-app grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="bg-surface-warm rounded-2xl p-4 md:p-6 border border-border">
          <div className="rounded-xl overflow-hidden aspect-[16/10] mb-6">
            <LazyImage src={roomImage(room)} alt={room.name} wrapperClassName="h-full w-full" />
          </div>
          <Badge variant={room.stock > 0 ? 'available' : 'booked'} className="mb-3">
            {room.stock > 0 ? 'Tersedia' : 'Habis'}
          </Badge>
          <h1 className="text-hero text-2xl sm:text-3xl mb-3">{room.name}</h1>
          <p className="text-subtitle">{room.description}</p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-2">
            {(facilities.length ? facilities : ['WiFi', 'Area bersama']).map((f) => (
              <li key={f} className="text-sm flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md">
            <p className="text-label mb-2">Harga sewa</p>
            <p className="text-price-lg mb-1">{formatPrice(room.price)} / bulan</p>
            <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>Harga sudah termasuk listrik & air</p>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: room.stock > 2 ? '#22c55e' : room.stock > 0 ? '#f59e0b' : '#ef4444' }}
              />
              <p className="text-xs font-semibold" style={{
                color: room.stock > 2 ? 'var(--primary)' : room.stock > 0 ? '#d97706' : 'var(--destructive)'
              }}>
                {room.stock > 2
                  ? `${room.stock} kamar tersedia`
                  : room.stock > 0
                  ? `Hanya ${room.stock} kamar tersisa — segera booking!`
                  : 'Tidak tersedia saat ini'}
              </p>
            </div>

            {isRoomAvailable(room) ? (
              <a href={`/booking?room=${room.id}`}>
                <Button variant="primary" size="lg" className="w-full">
                  <Calendar className="h-4 w-4" />
                  Booking Sekarang
                </Button>
              </a>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Tidak tersedia
              </Button>
            )}

            {isRoomAvailable(room) && (
              <p className="text-[10px] text-center mt-3" style={{ color: 'var(--muted-foreground)' }}>
                Setelah booking, upload bukti transfer di tab Pembayaran.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
