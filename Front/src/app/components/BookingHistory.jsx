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

  const D = { bg: '#f8f7f2', card: '#ffffff', cardHover: '#f0f4ee', border: '#d9e2d3', text: '#2f3a34', muted: '#2f3a34', sub: '#c79a63' }

  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []
  const userBookings = bookings.filter(
    (b) => Number(b.user_id) === Number(user?.id) || Number(b.user?.id) === Number(user?.id)
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: D.muted }}>
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Memuat data booking…</span>
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
    <div className="rounded-3xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${D.border}`, background: '#faf8f5' }}>
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
                refetch={refetch}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function BookingHistoryItem({ booking: b, D, waMessage, isFirst, refetch }) {
  const [isRenewing, setIsRenewing] = useState(false)
  const [renewMonths, setRenewMonths] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const requestRenewalMutation = useRequestBookingRenewalMutation()

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const uploadToast = toast.loading('Mengunggah bukti transfer...')

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64Image = reader.result
        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${b.id}/payment-receipt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64Image }),
        })

        if (!response.ok) {
          throw new Error('Gagal mengunggah')
        }

        toast.success('Bukti transfer berhasil diunggah!', { id: uploadToast })
        if (typeof refetch === 'function') refetch()
      } catch (err) {
        toast.error('Gagal mengunggah bukti transfer.', { id: uploadToast })
      } finally {
        setIsUploading(false)
      }
    }
    reader.onerror = () => {
      toast.error('Gagal membaca file gambar.', { id: uploadToast })
      setIsUploading(false)
    }
  }

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

        <div className="text-sm font-semibold pt-1" style={{ color: D.text }}>
          Total Biaya:{' '}
          <span style={{ color: '#c79a63' }}>{formatPrice(totalPrice)}</span>
        </div>

        {/* Form Perpanjang */}
        {isRenewing && (
          <div className="pt-3 flex items-center gap-2 flex-wrap">
            <label className="text-xs font-semibold" style={{ color: D.text }}>Pilih Durasi:</label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border bg-[#f8f7f2] outline-none"
              style={{ borderColor: D.border, color: D.text }}
            >
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
            <button
              onClick={handleRenew}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#6b8f71] text-[#ffffff] cursor-pointer hover:bg-[#56745c] transition-colors"
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

      <div className="flex flex-wrap sm:items-center gap-3">
        {/* Bukti Transfer Upload / Status */}
        {b.status === 'pending' && (
          <div className="flex items-center gap-2 flex-wrap">
            {b.payment_receipt ? (
              <>
                <a
                  href={b.payment_receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 border cursor-pointer"
                  style={{ borderColor: D.border, color: D.text, background: 'rgba(107,143,113,0.06)' }}
                >
                  Lihat Bukti Bayar
                </a>
                <label className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer">
                  <span>Ganti Bukti</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <label
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 text-white cursor-pointer shadow-sm active:scale-95"
                style={{
                  background: 'linear-gradient(135deg,#6b8f71,#56745c)',
                  color: '#ffffff'
                }}
              >
                <span>Upload Bukti Bayar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Tombol Perpanjang */}
        {b.status === 'accepted' && !b.renewal_requested && !isRenewing && (
          <button
            onClick={() => setIsRenewing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer hover:opacity-95"
            style={{ background: '#6b8f71', color: '#ffffff' }}
          >
            Perpanjang Sewa
          </button>
        )}

        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 border"
          style={{
            background: 'rgba(107,143,113,0.06)',
            color: '#6b8f71',
            borderColor: 'rgba(107,143,113,0.2)'
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
