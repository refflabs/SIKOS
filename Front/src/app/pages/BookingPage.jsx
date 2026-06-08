import { useEffect, useState } from 'react'
import { Calendar, Lock } from 'lucide-react'
import { Button } from '../components/Button'
import { LazyImage } from '../../components/LazyImage'
import {
  useRoomsQuery,
  useRoomQuery,
  useCreateBookingMutation,
} from '../../hooks/queries'
import { register, login, isAuthenticated } from '../../api/auth'
import { formatPrice, roomImage } from '../../api/roomUtils'
import { QueryError } from '../../components/QueryError'

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
  const [loggedIn, setLoggedIn] = useState(isAuthenticated())
  const [message, setMessage] = useState({ type: '', text: '' })

  const [form, setForm] = useState({
    room_id: preselectedRoom || '',
    check_in: '',
    duration_months: '1',
    notes: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })

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

  const ensureAuth = async () => {
    if (isAuthenticated()) return true
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setLoggedIn(true)
      return true
    } catch {
      try {
        await login(form.email, form.password)
        setLoggedIn(true)
        return true
      } catch {
        return false
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    try {
      if (!loggedIn) {
        const ok = await ensureAuth()
        if (!ok) {
          setMessage({
            type: 'error',
            text: 'Login gagal. Periksa email/password (min. 8 karakter).',
          })
          return
        }
      }

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
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Booking gagal. Pastikan kamar masih tersedia.',
      })
    }
  }

  const total = room ? Number(room.price) * Number(form.duration_months || 1) : 0
  const loading = roomsLoading || (roomLoading && roomId)

  return (
    <div className="pb-20">
      <div className="bg-surface-teal border-b border-border">
        <div className="container-app py-8 md:py-10 max-w-5xl">
          <p className="text-label text-teal-800/70 mb-2">Reservasi</p>
          <h1 className="text-hero text-2xl sm:text-3xl mb-2">Form booking</h1>
          <p className="text-subtitle text-sm">Lengkapi data — proses cepat & aman.</p>
        </div>
      </div>

      <div className="container-app py-8 max-w-5xl">
        {message.text && (
          <div
            className={`mb-8 px-4 py-3 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
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
              className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-6 shadow-sm"
            >
              {!loggedIn && (
                <div className="space-y-4 pb-6 border-b border-border bg-surface-warm -mx-6 md:-mx-8 px-6 md:px-8 pt-2 pb-6 rounded-t-2xl">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Data akun
                  </p>
                  <input name="name" placeholder="Nama lengkap" value={form.name} onChange={handleChange} className="input-field" required />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input-field" required />
                    <input name="phone" placeholder="WhatsApp" value={form.phone} onChange={handleChange} className="input-field" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input-field" required minLength={8} />
                    <input name="password_confirmation" type="password" placeholder="Ulangi password" value={form.password_confirmation} onChange={handleChange} className="input-field" required />
                  </div>
                </div>
              )}

              <div>
                <label className="text-label block mb-2">Kamar</label>
                <select name="room_id" value={form.room_id} onChange={handleChange} className="input-field" required>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {formatPrice(r.price)}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label block mb-2">Tanggal mulai</label>
                  <input type="date" name="check_in" value={form.check_in} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="text-label block mb-2">Durasi</label>
                  <select name="duration_months" value={form.duration_months} onChange={handleChange} className="input-field">
                    {[1, 3, 6, 12].map((m) => (
                      <option key={m} value={m}>{m} bulan</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-label block mb-2">Catatan</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="input-field resize-none" />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={createBooking.isPending || message.type === 'success'}>
                {createBooking.isPending ? 'Mengirim…' : 'Kirim booking'}
              </Button>
            </form>

            <div className="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-white overflow-hidden shadow-md">
              {room ? (
                <>
                  <LazyImage src={roomImage(room)} alt={room.name} wrapperClassName="aspect-[16/10] w-full" />
                  <div className="p-6">
                    <h3 className="font-semibold mb-4">{room.name}</h3>
                    <div className="space-y-2 text-sm border-t border-border pt-4">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Harga/bulan</span>
                        <span>{formatPrice(room.price)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Durasi</span>
                        <span>{form.duration_months} bln</span>
                      </div>
                      <div className="flex justify-between font-bold pt-3 border-t border-border">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="p-8 text-subtitle text-sm text-center">Pilih kamar</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
