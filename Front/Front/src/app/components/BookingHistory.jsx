import { useState } from 'react'
import { Inbox, CalendarDays, Clock, Loader2 } from 'lucide-react'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { QueryError } from '../../components/QueryError'
import { useBookingsQuery } from '../../hooks/queries'
import { formatPrice } from '../../api/roomUtils'
import { CONTACT_WHATSAPP } from '../../constants'

/**
 * BookingHistory — shows booking status, check-in/out, duration.
 * Payment receipt upload is handled separately in PaymentHistory.
 */
export function BookingHistory({ user }) {
  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []
  const userBookings = bookings.filter(
    (b) => Number(b.user_id) === Number(user?.id) || Number(b.user?.id) === Number(user?.id)
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--muted-foreground)' }}>
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--primary)' }} />
        <span className="text-sm">Memuat data booking…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <QueryError message="Gagal memuat histori booking." onRetry={refetch} />
      </div>
    )
  }

  if (userBookings.length === 0) {
    return (
      <EmptyState
        title="Belum Ada Booking"
        description="Anda belum memesan kamar kost apa pun saat ini."
        actionLabel="Cari Kamar"
        actionHref="/rooms"
      />
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Histori Booking</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Daftar pesanan kamar kost Anda yang sedang diproses maupun telah disetujui.
          Untuk upload bukti pembayaran, gunakan menu <strong>Histori Pembayaran</strong>.
        </p>
      </div>

      <div>
        {userBookings.map((b, i) => {
          const waMessage = `Halo Pak RT, saya ingin menanyakan status booking saya untuk kamar ${b.room?.name || 'Kost'}. (Booking ID: ${b.id})`
          return (
            <BookingHistoryItem
              key={b.id}
              booking={b}
              waMessage={waMessage}
              isFirst={i === 0}
            />
          )
        })}
      </div>
    </div>
  )
}

function BookingHistoryItem({ booking: b, waMessage, isFirst }) {
  const [isRenewing, setIsRenewing] = useState(false)
  const [renewMonths, setRenewMonths] = useState(1)

  const roomPrice = Number(b.room?.price) || 0
  const duration = Number(b.duration_months) || 1
  const totalPrice = roomPrice * duration

  const statusLabel =
    b.status === 'confirmed' || b.status === 'accepted' ? 'Aktif'
    : b.status === 'pending' ? 'Menunggu Konfirmasi'
    : b.status === 'rejected' ? 'Ditolak / Kadaluarsa'
    : 'Selesai'

  const statusBadgeVariant =
    b.status === 'confirmed' || b.status === 'accepted' ? 'available'
    : b.status === 'pending' ? 'booked'
    : 'default'

  return (
    <div
      className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-colors duration-200"
      style={{
        borderTop: !isFirst ? '1px solid var(--border)' : 'none',
        background: 'transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="space-y-2.5 flex-1">
        {/* Title + badge row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
            {b.room?.name || 'Kamar Kost'}
          </h3>
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          {b.renewal_requested && (
            <Badge variant="booked">Minta Perpanjang ({b.renewal_months} Bln)</Badge>
          )}
        </div>

        {/* Booking ID */}
        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          Booking ID: <span className="font-mono font-semibold">#{b.id}</span>
        </p>

        {/* Date & duration info */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent, #c79a63)' }} />
            Mulai: {b.check_in ? String(b.check_in).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent, #c79a63)' }} />
            Selesai: {b.check_out ? String(b.check_out).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent, #c79a63)' }} />
            Durasi: {b.duration_months || 1} Bulan
          </span>
        </div>

        {/* Total cost */}
        <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Total Biaya:{' '}
          <span style={{ color: 'var(--accent, #c79a63)' }}>{formatPrice(totalPrice)}</span>
        </div>

        {/* Renewal duration picker */}
        {isRenewing && (
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Pilih Durasi:</label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}
            >
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap sm:items-center gap-2.5">
        {/* Payment status indicator — user sees this, upload is in PaymentHistory */}
        {(b.status === 'pending' || b.status === 'rejected') && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border"
            style={{
              borderColor: b.status === 'rejected' ? '#dc2626' : (b.has_payment_receipt || b.payment_receipt) ? 'var(--primary)' : 'var(--accent, #c79a63)',
              color: b.status === 'rejected' ? '#dc2626' : (b.has_payment_receipt || b.payment_receipt) ? 'var(--primary)' : 'var(--accent, #c79a63)',
              background: 'transparent',
            }}
          >
            {b.status === 'rejected' ? '✗ Pembayaran kadaluarsa/ditolak' : (b.has_payment_receipt || b.payment_receipt) ? '✓ Bukti terunggah' : '⏳ Menunggu bukti bayar'}
          </span>
        )}

        <a
          href={`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 border cursor-pointer"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
            background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Hubungi Pak RT
        </a>
      </div>
    </div>
  )
}
