import { Inbox, CalendarDays, CreditCard, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { LoadingSpinner } from './LoadingSpinner'
import { QueryError } from '../../components/QueryError'
import { useBookingsQuery } from '../../hooks/queries'
import { useTheme } from '../../context/ThemeContext'
import { formatPrice } from '../../api/roomUtils'

export function PaymentHistory({ user }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = isDark
    ? { bg: '#120d08', card: '#1d1409', cardHover: '#231808', border: '#3a2a18', text: '#E1DCC9', muted: '#8a7060', sub: '#5a4030' }
    : { bg: '#F7F4E8', card: '#FDFCF9', cardHover: '#f5f0e8', border: '#D8D0BE', text: '#3A342E', muted: '#7a6247', sub: '#b8a898' }

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
        <QueryError message="Gagal memuat histori pembayaran." onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${D.border}`, background: isDark ? '#231808' : '#f5f0e8' }}>
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: D.text }}>
          <CreditCard className="h-5 w-5 text-[#CFA16D]" />
          Histori Pembayaran Anda
        </h2>
        <p className="text-xs mt-1" style={{ color: D.muted }}>
          Riwayat transaksi, bukti transfer, dan status verifikasi pembayaran sewa kost Anda.
        </p>
      </div>

      {userBookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Tidak ada transaksi"
          description="Anda belum memiliki riwayat transaksi atau booking aktif."
          actionLabel="Cari Kamar"
          actionHref="/rooms"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr style={{ background: isDark ? '#1a1208' : '#faf8f5', borderBottom: `1px solid ${D.border}`, color: D.text }}>
                <th className="p-4 pl-6 font-bold">Kamar Kost</th>
                <th className="p-4 font-bold">Periode Sewa</th>
                <th className="p-4 font-bold">Total Pembayaran</th>
                <th className="p-4 font-bold">Bukti Transfer</th>
                <th className="p-4 pr-6 font-bold text-right">Status Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: D.border, color: D.text }}>
              {userBookings.map((b) => {
                const totalPrice = b.room ? Number(b.room.price) * Number(b.duration_months || 1) : 0
                
                // Status mapping
                let statusLabel = 'Belum Upload Bukti'
                let statusColor = isDark ? 'text-stone-400 bg-stone-500/10 border-stone-500/20' : 'text-stone-600 bg-stone-100 border-stone-200'
                let statusIcon = <Clock className="h-3 w-3" />

                if (b.payment_receipt) {
                  if (b.status === 'accepted' || b.status === 'confirmed') {
                    statusLabel = 'Lunas / Terverifikasi'
                    statusColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                    statusIcon = <CheckCircle className="h-3 w-3" />
                  } else if (b.status === 'rejected') {
                    statusLabel = 'Ditolak / Gagal'
                    statusColor = 'text-rose-600 bg-rose-500/10 border-rose-500/20'
                    statusIcon = <AlertCircle className="h-3 w-3" />
                  } else {
                    statusLabel = 'Menunggu Verifikasi'
                    statusColor = 'text-amber-600 bg-amber-500/10 border-amber-500/20'
                    statusIcon = <Clock className="h-3 w-3 animate-pulse" />
                  }
                }

                return (
                  <tr key={b.id} className="transition-colors hover:bg-stone-50/5" style={{ background: 'transparent' }}>
                    <td className="p-4 pl-6">
                      <span className="font-bold block">{b.room?.name || 'Kamar Kost'}</span>
                      <span className="text-[10px] block mt-0.5" style={{ color: D.muted }}>Booking ID: #{b.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-[#CFA16D]" />
                        {b.check_in ? String(b.check_in).slice(0, 10) : '—'} s/d {b.check_out ? String(b.check_out).slice(0, 10) : '—'}
                      </span>
                    </td>
                    <td className="p-4 font-semibold" style={{ color: '#CFA16D' }}>
                      {formatPrice(totalPrice)}
                    </td>
                    <td className="p-4">
                      {b.payment_receipt ? (
                        <a
                          href={b.payment_receipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-[#CFA16D] hover:underline"
                        >
                          Lihat Bukti Bayar
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-medium" style={{ color: D.muted }}>Belum diunggah</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusColor}`}>
                        {statusIcon}
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
