import { Star, ArrowRight } from 'lucide-react'
import { Badge } from './Badge'
import { Button } from './Button'
import { LazyImage } from '../../components/LazyImage'
import { useTheme } from '../../context/ThemeContext'
import {
  formatPrice,
  isRoomAvailable,
  roomFacilities,
  roomImage,
} from '../../api/roomUtils'

export function ListingCard({
  room,
  showCta = true,
  ctaStyle = 'subtle',
  featured = false,
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const available = isRoomAvailable(room)
  const facilities = roomFacilities(room)

  return (
    <article className="group flex flex-col h-full">
      {/* ── Image ── */}
      <a
        href={`/room-detail?id=${room.id}`}
        className={`block relative overflow-hidden ${
          featured ? 'aspect-[16/10] rounded-t-2xl' : 'aspect-[4/3] rounded-t-2xl'
        }`}
      >
        <LazyImage
          src={roomImage(room)}
          alt={room.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
          wrapperClassName="h-full w-full"
        />
        {/* Subtle bottom gradient for price readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 55%)' }}
        />
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={room.stock > 0 ? 'available' : 'booked'}>{room.stock > 0 ? 'Tersedia' : 'Habis'}</Badge>
        </div>
        {/* Rating pill */}
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{
            background: isDark ? 'rgba(39,49,43,0.9)' : 'rgba(255,255,255,0.9)',
            color: 'var(--foreground)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          4.9
        </div>
        {/* Price pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
              background: isDark ? 'rgba(39,49,43,0.92)' : 'rgba(255,255,255,0.92)',
              color: 'var(--foreground)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {formatPrice(room.price)}
            <span className="font-normal text-[10px]" style={{ color: 'var(--primary)' }}>/ bln</span>
          </span>
        </div>
      </a>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 gap-1 p-4">
        <a href={`/room-detail?id=${room.id}`} className="min-w-0">
          <h3
            className={`font-bold truncate leading-snug transition-colors duration-200 group-hover:text-primary ${
              featured ? 'text-lg' : 'text-[15px]'
            }`}
            style={{ color: 'var(--foreground)' }}
          >
            {room.name}
          </h3>
        </a>

        <p className="text-xs flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
          <span className="capitalize font-medium">{room.type === 'kosongan' ? 'Kosongan' : 'Fasilitas (Isian)'}</span>
          {room.size ? ` · ${room.size}` : ''}
        </p>

        <p className="text-xs font-semibold" style={{ color: room.stock > 0 ? 'var(--primary)' : '#c0392b' }}>
          {room.stock > 0 ? `${room.stock} kamar tersedia` : 'Tidak tersedia'}
        </p>

        {/* Facility chips */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: isDark ? 'rgba(107,143,113,0.15)' : 'rgba(107,143,113,0.1)',
                  color: 'var(--primary)',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="mt-auto pt-3">
            {available ? (
              <a href={`/booking?room=${room.id}`} className="w-full">
                {ctaStyle === 'primary' ? (
                  <Button variant="primary" size="md" className="w-full text-xs py-2.5 rounded-xl">
                    Booking Sekarang
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 bg-transparent border-border text-foreground hover:bg-secondary"
                  >
                    <span>Lihat &amp; Booking</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </a>
            ) : (
              <Button
                variant="outline"
                size="md"
                className="w-full text-xs py-2.5 rounded-xl opacity-40 cursor-not-allowed bg-transparent border-border text-foreground"
                disabled
              >
                Tidak Tersedia
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
