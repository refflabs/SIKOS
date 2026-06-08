import { MapPin, Star } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'
import { LazyImage } from '../../components/LazyImage'
import {
  formatPrice,
  isRoomAvailable,
  roomFacilities,
  roomImage,
  statusLabel,
} from '../../api/roomUtils'

export function ListingCard({
  room,
  showCta = true,
  ctaStyle = 'subtle',
  featured = false,
}) {
  const available = isRoomAvailable(room)
  const facilities = roomFacilities(room)

  return (
    <article className={`group flex flex-col h-full ${featured ? '' : ''}`}>
      <a
        href={`/room-detail?id=${room.id}`}
        className={`block relative overflow-hidden rounded-xl mb-3 ${
          featured ? 'aspect-[16/10]' : 'aspect-[4/3]'
        }`}
      >
        <LazyImage
          src={roomImage(room)}
          alt={room.name}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
          wrapperClassName="h-full w-full"
        />
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={room.status}>{statusLabel(room.status)}</Badge>
        </div>
      </a>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-start justify-between gap-2">
          <a href={`/room-detail?id=${room.id}`} className="min-w-0">
            <h3
              className={`font-semibold text-foreground truncate group-hover:underline underline-offset-2 ${
                featured ? 'text-lg' : 'text-[15px]'
              }`}
            >
              {room.name}
            </h3>
          </a>
          <span className="flex items-center gap-0.5 text-xs shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            4.9
          </span>
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {room.type ? `${room.type} · ` : ''}
          {room.size || 'Jakarta Selatan'}
        </p>

        {facilities.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {facilities.slice(0, 3).join(' · ')}
          </p>
        )}

        <div className="flex items-baseline gap-1 mt-2">
          <span className={featured ? 'text-price-lg' : 'text-price'}>
            {formatPrice(room.price)}
          </span>
          <span className="text-xs text-muted-foreground font-normal">/ bulan</span>
        </div>

        {showCta && (
          <div className="mt-3 pt-1 mt-auto">
            {available ? (
              <a href={`/booking?room=${room.id}`}>
                {ctaStyle === 'primary' ? (
                  <Button variant="primary" size="md" className="w-full">
                    Booking sekarang
                  </Button>
                ) : (
                  <Button variant="outline" size="md" className="w-full text-sm">
                    Lihat & booking →
                  </Button>
                )}
              </a>
            ) : (
              <Button variant="outline" size="md" className="w-full" disabled>
                Tidak tersedia
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
