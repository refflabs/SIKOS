import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, ChevronRight } from 'lucide-react'
import { Button } from '../components/Button'
import { LazyImage } from '../../components/LazyImage'
import {
  useRoomsQuery,
  useRoomQuery,
  useCreateBookingMutation,
} from '../../hooks/queries'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { formatPrice, roomImage, roomFacilities } from '../../api/roomUtils'
import { QueryError } from '../../components/QueryError'
import { toast } from 'sonner'

function BookingFormSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 animate-pulse">
      <div className="h-96 rounded-2xl bg-slate-200" />
      <div className="h-80 rounded-2xl bg-slate-100" />
    </div>
  )
}

export function BookingPage({ search = '' }) {
  const preselectedRoom = new URLSearchParams(search).get('room')
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [message, setMessage] = useState({ type: '', text: '' })

  const [form, setForm] = useState({
    room_id: preselectedRoom || '',
    check_in: '',
    duration_months: '1',
    notes: '',
  })

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = preselectedRoom
        ? `/booking?room=${preselectedRoom}`
        : '/booking'
      window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`
    }
  }, [authLoading, isAuthenticated, preselectedRoom])

  const { data: roomsData, isLoading: roomsLoading, isError: roomsError, refetch } =
    useRoomsQuery({ status: 'available' })
  const rooms = Array.isArray(roomsData) ? roomsData : []

  const roomId = form.room_id || preselectedRoom || rooms[0]?.id
  const { data: room, isLoading: roomLoading } = useRoomQuery(roomId ? String(roomId) : '', {
    enabled: Boolean(roomId),
  })

  const createBooking = useCreateBookingMutation()

  useEffect(() => {
    if (!form.room_id && rooms[0]?.id) {
      setForm((f) => ({ ...f, room_id: String(rooms[0].id) }))
    }
  }, [rooms, form.room_id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      await createBooking.mutateAsync({
        room_id: Number(form.room_id),
        check_in: form.check_in,
        duration_months: Number(form.duration_months),
        notes: form.notes || undefined,
      })

      setMessage({
        type: 'success',
        text: 'Booking berhasil! Admin akan menghubungi Anda segera.',
      })

      toast.success('Booking berhasil! Mengalihkan ke halaman Pembayaran...')
      setTimeout(() => {
        window.history.pushState({}, '', '/?tab=payments')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Booking gagal. Pastikan kamar masih tersedia.',
      })
    }
  }

  // Don't render until auth check completes
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const total = room ? Number(room.price) * Number(form.duration_months || 1) : 0
  const loading = roomsLoading || (roomLoading && roomId)

  return (
    <div className="pb-20">
      {/* Header + step breadcrumb */}
      <div
        className="border-b"
        style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}
      >
        <div className="container-app py-8 md:py-10 max-w-5xl">
          <p className="section-label mb-2">Reservasi</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: 'var(--foreground)' }}>Form Booking</h1>

          {/* Step breadcrumb */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Pilih Kamar', 'Isi Formulir', 'Upload Bukti Bayar', 'Konfirmasi Admin'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: i <= 1 ? 'var(--primary)' : 'var(--secondary)',
                    color: i <= 1 ? '#ffffff' : 'var(--muted-foreground)',
                  }}
                >
                  {step}
                </span>
                {i < 3 && <ChevronRight className="h-3 w-3" style={{ color: 'var(--muted-foreground)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8 max-w-5xl">
        {message.text && (
          <div
            className={`mb-8 px-4 py-3.5 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'border-emerald-200'
                : 'border-red-200'
            }`}
            style={{
              background: message.type === 'success' ? 'rgba(107,143,113,0.08)' : 'rgba(192,57,43,0.08)',
              color: message.type === 'success' ? 'var(--primary)' : 'var(--destructive)',
              borderColor: message.type === 'success' ? 'rgba(107,143,113,0.2)' : 'rgba(192,57,43,0.2)',
            }}
          >
            {message.type === 'success' ? (
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{message.text}</p>
                  <p className="text-xs mt-1 opacity-80">
                    Langkah berikutnya:{' '}
                    <a
                      href="/?tab=payments"
                      className="underline font-bold"
                      style={{ color: 'var(--accent)' }}
                    >
                      Upload bukti transfer di Pembayaran →
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              message.text
            )}
          </div>
        )}

        {loading ? (
          <BookingFormSkeleton />
        ) : roomsError ? (
          <QueryError message="Gagal memuat kamar." onRetry={() => refetch()} />
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 md:p-8 space-y-6 shadow-sm border bg-card"
              style={{
                borderColor: 'var(--border)'
              }}
            >
              <div>
                <label className="text-xs uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--foreground)' }}>Kamar</label>
                <select
                  name="room_id"
                  value={form.room_id}
                  onChange={handleChange}
                  className="input-field outline-none"
                  style={{
                    background: 'var(--secondary)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
                      {r.name} — {formatPrice(r.price)}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--foreground)' }}>Tanggal mulai</label>
                  <input
                    type="date"
                    name="check_in"
                    value={form.check_in}
                    onChange={handleChange}
                    className="input-field outline-none"
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--foreground)' }}>Durasi</label>
                  <select
                    name="duration_months"
                    value={form.duration_months}
                    onChange={handleChange}
                    className="input-field outline-none"
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    {[1, 3, 6, 12].map((m) => (
                      <option key={m} value={m} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>{m} bulan</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--foreground)' }}>Catatan (opsional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Contoh: saya mahasiswa, lebih suka lingkungan tenang, butuh parkir motor..."
                  className="input-field resize-none outline-none"
                  style={{
                    background: 'var(--secondary)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={createBooking.isPending || message.type === 'success'}>
                <Calendar className="h-4 w-4" />
                {createBooking.isPending ? 'Mengirim…' : 'Kirim Booking'}
              </Button>
            </form>

            <div
              className="lg:sticky lg:top-24 h-fit rounded-2xl overflow-hidden shadow-md border bg-card"
              style={{
                borderColor: 'var(--border)'
              }}
            >
              {room ? (
                <>
                  <LazyImage src={roomImage(room)} alt={room.name} wrapperClassName="aspect-[16/10] w-full" />
                  <div className="p-6">
                    <h3 className="font-bold text-base mb-1" style={{ color: 'var(--foreground)' }}>{room.name}</h3>
                    <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>{room.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {room.size && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
                          {room.size}
                        </span>
                      )}
                      {roomFacilities(room).map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-2 text-sm border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between" style={{ color: 'var(--muted-foreground)' }}>
                        <span>Harga/bulan</span>
                        <span>{formatPrice(room.price)}</span>
                      </div>
                      <div className="flex justify-between" style={{ color: 'var(--muted-foreground)' }}>
                        <span>Durasi</span>
                        <span>{form.duration_months} bln</span>
                      </div>
                      <div className="flex justify-between font-extrabold pt-3 border-t" style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="p-8 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>Pilih kamar</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
