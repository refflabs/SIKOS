import { useEffect, useMemo } from 'react'
import { Building2, CalendarDays, DoorOpen, Inbox } from 'lucide-react'
import { AdminLayout } from '../layouts/AdminLayout'
import { StatCard } from '../components/StatCard'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { useRoomsQuery, useBookingsQuery } from '../../hooks/queries'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../api/roomUtils'
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton'
import { QueryError } from '../../components/QueryError'
import { useSocket } from '../../context/SocketContext'
import { AdminChatPanel } from '../components/AdminChatPanel'

export function DashboardPage({ search = '' }) {
  const tab = new URLSearchParams(search).get('tab') || 'overview'
  const { user } = useAuth()
  const { refreshSubscriptions } = useSocket()

  const roomsQuery = useRoomsQuery()
  const bookingsQuery = useBookingsQuery()

  useEffect(() => {
    refreshSubscriptions()
  }, [refreshSubscriptions])

  const rooms = Array.isArray(roomsQuery.data) ? roomsQuery.data : []
  const bookings = Array.isArray(bookingsQuery.data) ? bookingsQuery.data : []

  const stats = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      booked: rooms.filter((r) => r.status === 'booked').length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    }),
    [rooms, bookings],
  )

  const loading = roomsQuery.isLoading || bookingsQuery.isLoading
  const error =
    roomsQuery.isError || bookingsQuery.isError
      ? 'Gagal memuat data dashboard.'
      : ''

  const activeTab =
    tab === 'rooms'
      ? 'rooms'
      : tab === 'bookings'
      ? 'bookings'
      : tab === 'chats'
      ? 'chats'
      : tab === 'settings'
      ? 'settings'
      : 'overview'

  return (
    <AdminLayout activeTab={activeTab}>
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <QueryError
          message={error}
          onRetry={() => {
            roomsQuery.refetch()
            bookingsQuery.refetch()
          }}
        />
      ) : activeTab === 'chats' ? (
        <AdminChatPanel />
      ) : activeTab === 'settings' ? (
        <div className="rounded-xl border border-border bg-white p-8">
          <h2 className="text-section-title mb-2">Pengaturan</h2>
          <p className="text-subtitle text-sm">Konfigurasi akun admin & notifikasi — segera hadir.</p>
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-section-title">Semua booking ({bookings.length})</h2>
          </div>
          {bookings.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Belum ada booking"
              description="Notifikasi real-time akan muncul saat ada booking baru."
              actionLabel="Ke beranda"
              actionHref="/"
            />
          ) : (
            <div className="divide-y divide-border">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-wrap justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium text-sm">{b.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.room?.name}</p>
                  </div>
                  <Badge variant={b.status === 'confirmed' ? 'available' : 'default'}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'rooms' ? (
        <div>
          <h2 className="text-section-title mb-6">Semua kamar ({rooms.length})</h2>
          <div className="rounded-xl border border-border bg-white divide-y divide-border">
            {rooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.type} · {formatPrice(r.price)}</p>
                </div>
                <Badge variant={r.status}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-label mb-1">Overview</p>
            <h2 className="text-section-title">Selamat datang, {user?.name?.split(' ')[0] || 'Admin'}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total kamar" value={stats.total} icon={Building2} accent="indigo" />
            <StatCard label="Tersedia" value={stats.available} icon={DoorOpen} accent="teal" />
            <StatCard label="Terisi" value={stats.booked} icon={Building2} accent="amber" />
            <StatCard
              label="Booking pending"
              value={stats.pendingBookings}
              icon={CalendarDays}
              accent="indigo"
            />
          </div>

          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Booking terbaru</h3>
              <span className="text-xs text-muted-foreground">{bookings.length} total</span>
            </div>
            {bookings.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Belum ada booking"
                description="Booking dari penghuni akan muncul di sini secara real-time begitu mereka mengirim formulir."
                actionLabel="Lihat kamar"
                actionHref="/rooms"
              />
            ) : (
              <div className="divide-y divide-border">
                {bookings.slice(0, 15).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-surface-warm/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{b.user?.name || `User #${b.user_id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.room?.name} · {String(b.check_in).slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold">{formatPrice(b.total_price)}</span>
                      <Badge variant={b.status === 'confirmed' ? 'available' : 'default'}>
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
