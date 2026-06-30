import { MapPin, Star, ArrowRight } from 'lucide-react'
import { Badge } from './Badge'
import { LazyImage } from '../../components/LazyImage'
import { useTheme } from '../../context/ThemeContext'
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // ── Dynamic tokens ──
  const C = isDark ? {
    mocca:       '#c79a63',
    moccaBtn:    '#c79a63',
    beige:       '#1f2722',
    coffee:      '#f8f7f2',        // nama kamar — krem terang
    muted:       '#9cb5a4',        // teks muted
    border:      '#323e37',
    badgeBg:     'rgba(107,143,113,0.18)',
    badgeText:   '#88ad8e',
    btnBg:       'transparent',
    btnColor:    '#88ad8e',
    btnBorder:   '#323e37',
    btnHoverBg:  '#88ad8e',
    btnHoverColor: '#1f2722',
    btnHoverBorder: '#88ad8e',
    ctaPrimBg:   'linear-gradient(135deg,#6b8f71,#88ad8e)',
    ctaPrimColor: '#1f2722',
  } : {
    mocca:       '#c79a63',
    moccaBtn:    '#c79a63',
    beige:       '#f8f7f2',
    coffee:      '#2f3a34',        // nama kamar — gelap
    muted:       '#2f3a34',
    border:      '#d9e2d3',
    badgeBg:     'rgba(107,143,113,0.1)',
    badgeText:   '#6b8f71',
    btnBg:       'transparent',
    btnColor:    '#6b8f71',
    btnBorder:   '#d9e2d3',
    btnHoverBg:  '#6b8f71',
    btnHoverColor: '#ffffff',
    btnHoverBorder: '#6b8f71',
    ctaPrimBg:   'linear-gradient(135deg,#6b8f71,#56745c)',
    ctaPrimColor: '#ffffff',
  }

  const available = isRoomAvailable(room)
  const facilities = roomFacilities(room)

  return (
    <article className="group flex flex-col h-full">
      {/* ── Image ── */}
      <a
        href={`/room-detail?id=${room.id}`}
        className={`block relative overflow-hidden mb-0 ${
          featured ? 'aspect-[16/10] rounded-2xl' : 'aspect-[4/3] rounded-2xl'
        }`}
        style={{ boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(107,143,113,0.08)' }}
      >
        <LazyImage
          src={roomImage(room)}
          alt={room.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
          wrapperClassName="h-full w-full"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(31,21,12,0.45) 0%, transparent 50%)' }}
        />
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={room.stock > 0 ? 'available' : 'booked'}>{room.stock > 0 ? 'Tersedia' : 'Habis'}</Badge>
        </div>
        {/* Rating pill */}
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: isDark ? 'rgba(39,49,43,0.92)' : 'rgba(253,252,249,0.92)', color: isDark ? '#f8f7f2' : '#2f3a34', backdropFilter: 'blur(6px)' }}
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          4.9
        </div>
        {/* Price pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl text-xs font-bold"
            style={{ background: isDark ? 'rgba(39,49,43,0.92)' : 'rgba(253,252,249,0.92)', color: isDark ? '#f8f7f2' : '#2f3a34', backdropFilter: 'blur(6px)' }}
          >
            {formatPrice(room.price)}
            <span className="font-normal text-[10px]" style={{ color: isDark ? '#9cb5a4' : '#6b8f71' }}>/ bln</span>
          </span>
        </div>
      </a>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 gap-1 pt-3 px-1">
        <a href={`/room-detail?id=${room.id}`} className="min-w-0">
          <h3
            className={`font-bold truncate leading-snug transition-colors duration-200 group-hover:underline underline-offset-2 ${
              featured ? 'text-lg' : 'text-[15px]'
            }`}
            style={{ color: C.coffee }}
          >
            {room.name}
          </h3>
        </a>

        <p className="text-xs flex items-center gap-1" style={{ color: C.muted }}>
          <span className="capitalize font-semibold">{room.type === 'kosongan' ? 'Kosongan' : 'Fasilitas (Isian)'}</span>
          {room.size ? ` · ${room.size}` : ''}
        </p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: room.stock > 0 ? '#6b8f71' : '#c0392b' }}>
          Tersedia: {room.stock} Kamar
        </p>

        {/* Facility badges */}
        {facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: C.badgeBg, color: C.badgeText }}
              >
                {f}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="mt-3 mt-auto">
            {available ? (
              <a
                href={`/booking?room=${room.id}`}
                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                style={
                  ctaStyle === 'primary'
                    ? { background: C.ctaPrimBg, color: C.ctaPrimColor, boxShadow: isDark ? '0 2px 10px rgba(176,186,153,0.18)' : '0 2px 10px rgba(65,45,21,0.25)' }
                    : { background: C.btnBg, color: C.btnColor, border: `1.5px solid ${C.btnBorder}`, textDecoration: 'none' }
                }
                onMouseEnter={e => {
                  if (ctaStyle !== 'primary') {
                    e.currentTarget.style.background = C.btnHoverBg
                    e.currentTarget.style.color = C.btnHoverColor
                    e.currentTarget.style.borderColor = C.btnHoverBorder
                  }
                }}
                onMouseLeave={e => {
                  if (ctaStyle !== 'primary') {
                    e.currentTarget.style.background = C.btnBg
                    e.currentTarget.style.color = C.btnColor
                    e.currentTarget.style.borderColor = C.btnBorder
                  }
                }}
              >
                {ctaStyle === 'primary' ? (
                  'Booking Sekarang'
                ) : (
                  <>
                    <span>Lihat & Booking</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </a>
            ) : (
              <div
                className="w-full py-2.5 rounded-xl text-xs font-semibold opacity-40 cursor-not-allowed text-center"
                style={{ background: C.border, color: C.muted }}
              >
                Tidak Tersedia
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
