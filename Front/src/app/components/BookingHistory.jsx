import { Inbox, CalendarDays, Clock, HelpCircle } from 'lucide-react'
import { Badge } from './Badge'
import { EmptyState } from './EmptyState'
import { LoadingSpinner } from './LoadingSpinner'
import { QueryError } from '../../components/QueryError'
import { useBookingsQuery } from '../../hooks/queries'
import { formatPrice } from '../../api/roomUtils'

export function BookingHistory({ user }) {
  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []

  // Filter bookings to those belonging to the current user
  const userBookings = bookings.filter(
    (b) =>
      Number(b.user_id) === Number(user?.id) ||
      Number(b.user?.id) === Number(user?.id)
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl border border-border p-8 shadow-sm">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        <QueryError message="Gagal memuat histori booking." onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-border bg-stone-50/50">
        <h2 className="text-lg font-bold text-foreground">Histori Booking Anda</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Daftar pesanan kamar kost Anda yang sedang diproses maupun telah disetujui.
        </p>
      </div>

      {userBookings.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada pesanan"
          description="Anda belum memiliki riwayat booking kamar. Temukan kamar kost yang cocok untuk Anda sekarang juga."
          actionLabel="Cari Kamar"
          actionHref="/rooms"
        />
      ) : (
        <div className="divide-y divide-border">
          {userBookings.map((b) => {
            const totalPrice = b.room ? Number(b.room.price) * Number(b.duration_months || 1) : 0
            const statusLabel =
              b.status === 'confirmed'
                ? 'Disetujui'
                : b.status === 'pending'
                ? 'Menunggu'
                : b.status === 'rejected'
                ? 'Ditolak'
                : b.status

            const statusBadgeVariant =
              b.status === 'confirmed'
                ? 'available'
                : b.status === 'pending'
                ? 'booked'
                : 'default'

            const waMessage = `Halo Pak RT, saya ingin menanyakan status booking saya untuk kamar ${b.room?.name || 'Kost'}. (Booking ID: ${b.id})`

            return (
              <div key={b.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-stone-50/30 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground text-base">
                      {b.room?.name || 'Kamar Kost'}
                    </h3>
                    <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      Mulai: {b.check_in ? String(b.check_in).slice(0, 10) : '—'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      Durasi: {b.duration_months || 1} Bulan
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-foreground pt-1">
                    Total Biaya: <span className="text-teal-700">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex sm:items-center gap-3">
                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-colors"
                  >
                    Hubungi Pak RT
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
