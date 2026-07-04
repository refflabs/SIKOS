import { useState } from 'react'
import { CalendarDays, CreditCard, ExternalLink, CheckCircle, AlertCircle, Clock, Upload, Loader2, BookOpen, Receipt } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { LedgerView } from './LedgerView'
import { QueryError } from '../../components/QueryError'
import { useBookingsQuery } from '../../hooks/queries'
import { formatPrice } from '../../api/roomUtils'
import { toast } from 'sonner'
import { getBookingById } from '../../api/bookings'

/**
 * PaymentHistory — shows payment/transaction records and allows receipt upload.
 * This is treated as a separate accounting/transaction record system,
 * not mixed with the booking flow in BookingHistory.
 */
export function PaymentHistory({ user }) {
  const { data, isLoading, isError, refetch } = useBookingsQuery()
  const bookings = Array.isArray(data) ? data : []
  const userBookings = bookings.filter(
    (b) => Number(b.user_id) === Number(user?.id) || Number(b.user?.id) === Number(user?.id)
  )

  const [activeTab, setActiveTab] = useState('transactions') // 'transactions' | 'ledger'
  const [uploadingId, setUploadingId] = useState(null)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--muted-foreground)' }}>
        <Loader2 className="h-7 w-7 animate-spin" style={{ color: 'var(--primary)' }} />
        <span className="text-sm">Memuat riwayat transaksi…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <QueryError message="Gagal memuat histori pembayaran." onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Header with tab switcher */}
      <div className="px-6 pt-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--foreground)' }}>
          <CreditCard className="h-5 w-5" style={{ color: 'var(--accent, #c79a63)' }} />
          Histori Pembayaran
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
          Upload bukti transfer dan pantau status pembayaran sewa kost Anda.
        </p>

        {/* Tab switcher */}
        <div className="flex gap-1">
          {[
            { id: 'transactions', label: 'Riwayat Transaksi', icon: Receipt },
            { id: 'ledger', label: 'Buku Kas (Ledger)', icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all duration-150 cursor-pointer border-b-2"
              style={{
                borderColor: activeTab === id ? 'var(--primary)' : 'transparent',
                color: activeTab === id ? 'var(--primary)' : 'var(--muted-foreground)',
                background: 'transparent',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {userBookings.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Tidak ada transaksi"
          description="Anda belum memiliki riwayat transaksi. Booking kamar terlebih dahulu."
          actionLabel="Cari Kamar"
          actionHref="/rooms"
        />
      ) : activeTab === 'ledger' ? (
        <div className="p-6">
          <LedgerView bookings={userBookings} />
        </div>
      ) : (
        <div className="divide-y" style={{ '--divide-color': 'var(--border)' }}>
          {userBookings.map((b) => (
            <PaymentRow key={b.id} booking={b} refetch={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Individual payment row with receipt upload ─── */
function PaymentRow({ booking: b, refetch }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleViewReceipt = async (bookingId) => {
    const toastId = toast.loading('Memuat bukti pembayaran...')
    try {
      const data = await getBookingById(bookingId)
      toast.dismiss(toastId)
      if (data.payment_receipt) {
        const w = window.open()
        if (w) {
          w.document.write(`<img src="${data.payment_receipt}" style="max-width:100%; max-height:100vh; display:block; margin:auto; border-radius:8px; box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);" />`)
        } else {
          toast.error('Pop-up terblokir oleh browser Anda')
        }
      } else {
        toast.error('Bukti pembayaran tidak ditemukan')
      }
    } catch (err) {
      toast.dismiss(toastId)
      console.error(err)
      toast.error('Gagal mengambil data bukti bayar')
    }
  }

  const totalPrice = b.room ? Number(b.room.price) * Number(b.duration_months || 1) : 0

  // Payment status logic
  let statusLabel = 'Belum Upload Bukti'
  let statusVariant = 'pending' // 'pending' | 'waiting' | 'verified' | 'rejected'

  if (b.payment_receipt || b.has_payment_receipt) {
    if (b.status === 'accepted' || b.status === 'confirmed') {
      statusLabel = 'Lunas / Terverifikasi'
      statusVariant = 'verified'
    } else if (b.status === 'rejected') {
      statusLabel = 'Ditolak / Gagal'
      statusVariant = 'rejected'
    } else {
      statusLabel = 'Menunggu Verifikasi'
      statusVariant = 'waiting'
    }
  }

  const statusStyle = {
    pending:  { color: 'var(--muted-foreground)', bg: 'var(--secondary)', border: 'var(--border)', icon: <Clock className="h-3 w-3" /> },
    waiting:  { color: '#d97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)', icon: <Clock className="h-3 w-3 animate-pulse" /> },
    verified: { color: '#16a34a', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)', icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', icon: <AlertCircle className="h-3 w-3" /> },
  }[statusVariant]

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, dll.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

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
        toast.success('Bukti pembayaran berhasil diunggah!')
        refetch()
      } catch (err) {
        toast.error(err.message || 'Terjadi kesalahan saat mengunggah bukti bayar')
      } finally {
        setIsUploading(false)
      }
    }
    reader.onerror = () => {
      toast.error('Gagal membaca file')
      setIsUploading(false)
    }
  }

  return (
    <div
      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-200"
      style={{ borderTop: '1px solid var(--border)', background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Left: room + period info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
            {b.room?.name || 'Kamar Kost'}
          </span>
          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
            style={{ color: statusStyle.color, background: statusStyle.bg, borderColor: statusStyle.border }}
          >
            {statusStyle.icon}
            {statusLabel}
          </span>
        </div>

        <p className="text-[11px] font-mono" style={{ color: 'var(--muted-foreground)' }}>
          Booking #{b.id}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" style={{ color: 'var(--accent, #c79a63)' }} />
            {b.check_in ? String(b.check_in).slice(0, 10) : '—'} s/d {b.check_out ? String(b.check_out).slice(0, 10) : '—'}
          </span>
          <span className="font-semibold" style={{ color: 'var(--accent, #c79a63)' }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View existing receipt */}
        {(b.has_payment_receipt || b.payment_receipt) && (
          <button
            onClick={() => handleViewReceipt(b.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-dark)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
          >
            Lihat Bukti
            <ExternalLink className="h-3 w-3" />
          </button>
        )}

        {/* Upload receipt — only for pending bookings */}
        {b.status === 'pending' && (
          <label
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border"
            style={{
              background: isUploading ? 'var(--secondary)' : 'var(--primary)',
              color: isUploading ? 'var(--muted-foreground)' : '#ffffff',
              borderColor: isUploading ? 'var(--border)' : 'var(--primary)',
              opacity: isUploading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!isUploading) e.currentTarget.style.background = 'var(--primary-dark)' }}
            onMouseLeave={e => { if (!isUploading) e.currentTarget.style.background = 'var(--primary)' }}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3" />
                {(b.has_payment_receipt || b.payment_receipt) ? 'Ganti Bukti' : 'Upload Bukti Bayar'}
              </>
            )}
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
    </div>
  )
}
