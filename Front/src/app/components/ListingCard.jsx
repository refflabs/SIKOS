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
    mocca:       '#B0BA99',        // sage jadi primary text di dark
    moccaBtn:    '#B0BA99',
    beige:       '#E1DCC9',
    coffee:      '#E1DCC9',        // nama kamar — krem terang
    muted:       '#8a7060',        // teks muted
    border:      '#3a2a18',
    badgeBg:     'rgba(176,186,153,0.14)',
    badgeText:   '#B0BA99',
    btnBg:       'transparent',
    btnColor:    '#B0BA99',
    btnBorder:   '#3a2a18',
    btnHoverBg:  '#B0BA99',
    btnHoverColor: '#1F150C',
    btnHoverBorder: '#B0BA99',
    ctaPrimBg:   'linear-gradient(135deg,#B0BA99,#8a9478)',
    ctaPrimColor: '#1F150C',
  } : {
    mocca:       '#412D15',
    moccaBtn:    '#412D15',
    beige:       '#E1DCC9',
    coffee:      '#1F150C',        // nama kamar — gelap
    muted:       '#7a6247',
    border:      '#D8D0BE',
    badgeBg:     'rgba(176,186,153,0.18)',
    badgeText:   '#412D15',
    btnBg:       'transparent',
    btnColor:    '#412D15',
    btnBorder:   '#D8D0BE',
    btnHoverBg:  '#412D15',
    btnHoverColor: '#E1DCC9',
    btnHoverBorder: '#412D15',
    ctaPrimBg:   'linear-gradient(135deg,#412D15,#2e1e0a)',
    ctaPrimColor: '#E1DCC9',
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
        style={{ boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(31,21,12,0.08)' }}
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
          style={{ background: 'linear-gradient(to top, rgba(31,21,12,0.55) 0%, transparent 50%)' }}
        />
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={room.status}>{statusLabel(room.status)}</Badge>
        </div>
        {/* Rating pill */}
        <div
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(253,252,249,0.92)', color: '#1F150C', backdropFilter: 'blur(6px)' }}
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          4.9
        </div>
        {/* Price pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(253,252,249,0.92)', color: '#1F150C', backdropFilter: 'blur(6px)' }}
          >
            {formatPrice(room.price)}
            <span className="font-normal text-[10px]" style={{ color: '#7a6247' }}>/ bln</span>
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
          <MapPin className="h-3 w-3 shrink-0" style={{ color: '#B0BA99' }} />
          {room.type ? `${room.type}` : ''}
          {room.size ? ` · ${room.size}` : ''}
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
