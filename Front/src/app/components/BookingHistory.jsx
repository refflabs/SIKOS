import { useState } from 'react'
import { Inbox, CalendarDays, Clock } from 'lucide-react'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { LoadingSpinner } from './LoadingSpinner'
import { QueryError } from '../../components/QueryError'
import { useBookingsQuery, useRequestBookingRenewalMutation } from '../../hooks/queries'
import { useTheme } from '../../context/ThemeContext'
import { formatPrice } from '../../api/roomUtils'
import { toast } from 'sonner'

export function BookingHistory({ user }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = isDark
    ? { bg: '#120d08', card: '#1d1409', cardHover: '#231808', border: '#3a2a18', text: '#E1DCC9', muted: '#8a7060', sub: '#5a4030' }
    : { bg: '#F7F4EE', card: '#FDFCF9', cardHover: '#f5f0e8', border: '#D8D0BE', text: '#1F150C', muted: '#7a6247', sub: '#b8a898' }

  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []
  const userBookings = bookings.filter(
    (b) => Number(b.user_id) === Number(user?.id) || Number(b.user?.id) === Number(user?.id)
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl p-8"
        style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8" style={{ background: D.card, border: `1px solid ${D.border}` }}>
        <QueryError message="Gagal memuat histori booking." onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${D.border}`, background: isDark ? '#231808' : '#f5f0e8' }}>
        <h2 className="text-lg font-bold" style={{ color: D.text }}>Histori Booking Anda</h2>
        <p className="text-xs mt-1" style={{ color: D.muted }}>
          Daftar pesanan kamar kost Anda yang sedang diproses maupun telah disetujui.
        </p>
      </div>

      {userBookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada pesanan"
          description="Anda belum memiliki riwayat booking. Temukan kamar kost yang cocok sekarang."
          actionLabel="Cari Kamar"
          actionHref="/rooms"
        />
      ) : (
        <div style={{ divideColor: D.border }}>
          {userBookings.map((b, i) => {
            const waMessage = `Halo Pak RT, saya ingin menanyakan status booking saya untuk kamar ${b.room?.name || 'Kost'}. (Booking ID: ${b.id})`
            return (
              <BookingHistoryItem 
                key={b.id} 
                booking={b} 
                D={D} 
                waMessage={waMessage} 
                isFirst={i === 0} 
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function BookingHistoryItem({ booking: b, D, waMessage, isFirst }) {
  const [isRenewing, setIsRenewing] = useState(false)
  const [renewMonths, setRenewMonths] = useState(1)
  const requestRenewalMutation = useRequestBookingRenewalMutation()

  const totalPrice = b.room ? Number(b.room.price) * Number(b.duration_months || 1) : 0
  const statusLabel =
    b.status === 'confirmed' || b.status === 'accepted' ? 'Disetujui'
    : b.status === 'pending' ? 'Menunggu'
    : b.status === 'rejected' ? 'Ditolak'
    : b.status === 'ended' ? 'Selesai'
    : b.status
  const statusBadgeVariant =
    b.status === 'confirmed' || b.status === 'accepted' ? 'available'
    : b.status === 'pending' ? 'booked'
    : 'default'

  const handleRenew = async () => {
    try {
      await requestRenewalMutation.mutateAsync({ id: b.id, durationMonths: Number(renewMonths) })
      setIsRenewing(false)
      toast.success('Permintaan perpanjangan berhasil diajukan!')
    } catch (err) {
      toast.error('Gagal mengajukan perpanjangan sewa.')
    }
  }

  return (
    <div
      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-200"
      style={{
        borderTop: !isFirst ? `1px solid ${D.border}` : 'none',
        background: 'transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.background = D.cardHover}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-base" style={{ color: D.text }}>
            {b.room?.name || 'Kamar Kost'}
          </h3>
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          {b.renewal_requested && (
            <Badge variant="booked">Minta Perpanjang ({b.renewal_months} Bln)</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: D.muted }}>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#B0BA99' }} />
            Mulai: {b.check_in ? String(b.check_in).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#B0BA99' }} />
            Selesai: {b.check_out ? String(b.check_out).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" style={{ color: '#B0BA99' }} />
            Durasi: {b.duration_months || 1} Bulan
          </span>
        </div>

        <div className="text-sm font-semibold pt-1" style={{ color: D.text }}>
          Total Biaya:{' '}
          <span style={{ color: '#B0BA99' }}>{formatPrice(totalPrice)}</span>
        </div>

        {/* Form Perpanjang */}
        {isRenewing && (
          <div className="pt-3 flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold" style={{ color: D.text }}>Pilih Durasi:</label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-[#F7F4EE] outline-none"
              style={{ borderColor: D.border, color: D.text }}
            >
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
            <button
              onClick={handleRenew}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#412D15] text-[#E1DCC9] cursor-pointer hover:bg-black transition-colors"
            >
              Ajukan
            </button>
            <button
              onClick={() => setIsRenewing(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-200 text-stone-700 cursor-pointer hover:bg-stone-300 transition-colors"
            >
              Batal
            </button>
          </div>
        )}
      </div>

      <div className="flex sm:items-center gap-3">
        {/* Tombol Perpanjang */}
        {b.status === 'accepted' && !b.renewal_requested && !isRenewing && (
          <button
            onClick={() => setIsRenewing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:opacity-95"
            style={{ background: '#412D15', color: '#E1DCC9' }}
          >
            Perpanjang Sewa
          </button>
        )}

        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200"
          style={{ background: '#25D366', color: '#fff', boxShadow: '0 2px 8px rgba(37,211,102,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,211,102,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,211,102,0.25)' }}
        >
          Hubungi Pak RT
        </a>
      </div>
    </div>
  )
}
