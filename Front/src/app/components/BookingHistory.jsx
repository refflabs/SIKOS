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
  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []
  const userBookings = bookings.filter(
    (b) => Number(b.user_id) === Number(user?.id) || Number(b.user?.id) === Number(user?.id)
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--muted-foreground)' }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Memuat data booking…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
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
    <div className="rounded-3xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Histori Booking Anda</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Daftar pesanan kamar kost Anda yang sedang diproses maupun telah disetujui.
        </p>
      </div>

      <div style={{ divideColor: 'var(--border)' }}>
        {userBookings.map((b, i) => {
          const waMessage = `Halo Pak RT, saya ingin menanyakan status booking saya untuk kamar ${b.room?.name || 'Kost'}. (Booking ID: ${b.id})`
          return (
            <BookingHistoryItem 
              key={b.id} 
              booking={b} 
              waMessage={waMessage} 
              isFirst={i === 0} 
              refetch={refetch}
            />
          )
        })}
      </div>
    </div>
  )
}

function BookingHistoryItem({ booking: b, waMessage, isFirst, refetch }) {
  const [isRenewing, setIsRenewing] = useState(false)
  const [renewMonths, setRenewMonths] = useState(1)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const token = localStorage.getItem('token')

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64Image = reader.result
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${b.id}/payment-receipt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64Image }),
        })

        if (!res.ok) throw new Error('Gagal mengupload bukti transfer')
        toast.success('Bukti bayar berhasil diunggah!')
        refetch()
      } catch (err) {
        toast.error(err.message || 'Terjadi kesalahan saat mengunggah bukti bayar')
      } finally {
        setIsUploading(false)
      }
    }
    reader.onerror = () => {
      toast.error('Gagal membaca file bukti bayar')
      setIsUploading(false)
    }
  }

  const roomPrice = Number(b.room?.price) || 0
  const duration = Number(b.duration_months) || 1
  const totalPrice = roomPrice * duration

  const statusLabel =
    b.status === 'confirmed' || b.status === 'accepted' ? 'Aktif'
    : b.status === 'pending' ? 'Menunggu Konfirmasi'
    : 'Selesai'

  const statusBadgeVariant =
    b.status === 'confirmed' || b.status === 'accepted' ? 'available'
    : b.status === 'pending' ? 'booked'
    : 'default'

  return (
    <div
      className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-200"
      style={{
        borderTop: !isFirst ? '1px solid var(--border)' : 'none',
        background: 'transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
            {b.room?.name || 'Kamar Kost'}
          </h3>
          <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
          {b.renewal_requested && (
            <Badge variant="booked">Minta Perpanjang ({b.renewal_months} Bln)</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#c79a63' }} />
            Mulai: {b.check_in ? String(b.check_in).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: '#c79a63' }} />
            Selesai: {b.check_out ? String(b.check_out).slice(0, 10) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" style={{ color: '#c79a63' }} />
            Durasi: {b.duration_months || 1} Bulan
          </span>
        </div>

        <div className="text-sm font-semibold pt-1" style={{ color: 'var(--foreground)' }}>
          Total Biaya:{' '}
          <span style={{ color: '#c79a63' }}>{formatPrice(totalPrice)}</span>
        </div>

        {isRenewing && (
          <div className="pt-3 flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Pilih Durasi:</label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-card outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap sm:items-center gap-3">
        {b.status === 'pending' && (
          <label
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            style={{
              background: '#6b8f71',
              color: '#ffffff'
            }}
          >
            <span>{b.payment_receipt ? 'Ganti Bukti' : 'Upload Bukti Bayar'}</span>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
          </label>
        )}

        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 border cursor-pointer"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
            background: 'rgba(107,143,113,0.06)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(107,143,113,0.12)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(107,143,113,0.06)'
          }}
        >
          Hubungi Pak RT
        </a>
      </div>
    </div>
  )
}
