import { useState, useEffect } from 'react'
import { CalendarDays, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { 
  useBookingsQuery, 
  useRequestBookingRenewalMutation, 
  useUpdateBookingStatusMutation 
} from '../../hooks/queries'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

export function RenewalReminder() {
  const { user } = useAuth()
  const { data: bookings } = useBookingsQuery()
  const requestRenewalMutation = useRequestBookingRenewalMutation()
  const updateBookingStatusMutation = useUpdateBookingStatusMutation()

  const [activeReminder, setActiveReminder] = useState(null)
  const [daysLeft, setDaysLeft] = useState(0)
  const [isGracePeriod, setIsGracePeriod] = useState(false)
  const [renewalMonths, setRenewalMonths] = useState(1)
  const [step, setStep] = useState('prompt') // 'prompt' | 'input' | 'success'

  useEffect(() => {
    if (!user || user.role === 'admin' || !Array.isArray(bookings)) {
      setActiveReminder(null)
      return
    }

    const qualifyingBooking = bookings.find((b) => {
      if (Number(b.user_id) !== Number(user.id)) return false
      if (b.status !== 'accepted' || b.renewal_requested) return false
      if (sessionStorage.getItem(`sikos_declined_renewal_${b.id}`)) return false

      const checkOutDate = new Date(b.check_out)
      const today = new Date()
      checkOutDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      const diffTime = checkOutDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return (diffDays >= 0 && diffDays <= 7) || (diffDays < 0 && diffDays >= -3)
    })

    if (qualifyingBooking) {
      const checkOutDate = new Date(qualifyingBooking.check_out)
      const today = new Date()
      checkOutDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((checkOutDate - today) / (1000 * 60 * 60 * 24))

      setActiveReminder(qualifyingBooking)
      setDaysLeft(diffDays)
      setIsGracePeriod(diffDays < 0)
    } else {
      setActiveReminder(null)
    }
  }, [bookings])

  const handleDecline = async () => {
    if (!activeReminder) return

    if (isGracePeriod) {
      if (window.confirm('Apakah Anda yakin tidak ingin memperpanjang? Kamar Anda akan segera dikosongkan secara otomatis.')) {
        try {
          await updateBookingStatusMutation.mutateAsync({
            id: activeReminder.id,
            status: 'ended'
          })
          toast.success('Masa sewa Anda telah diakhiri. Kamar kini bebas sewa.')
          setActiveReminder(null)
        } catch (err) {
          toast.error('Gagal memproses pengosongan kamar.')
        }
      }
    } else {
      sessionStorage.setItem(`sikos_declined_renewal_${activeReminder.id}`, 'true')
      setActiveReminder(null)
    }
  }

  const handleRequestRenewal = async () => {
    if (!activeReminder) return

    try {
      await requestRenewalMutation.mutateAsync({
        id: activeReminder.id,
        durationMonths: Number(renewalMonths)
      })
      setStep('success')
    } catch (err) {
      toast.error('Gagal mengirim permintaan perpanjangan.')
    }
  }

  const handleClose = () => {
    if (activeReminder) {
      sessionStorage.setItem(`sikos_declined_renewal_${activeReminder.id}`, 'true')
    }
    setActiveReminder(null)
  }

  if (!activeReminder) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F150C]/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-3xl border border-[#D8D0BE] max-w-md w-full shadow-2xl overflow-hidden p-6 relative transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {step === 'prompt' && (
          <div className="space-y-4 text-center pt-3">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              isGracePeriod ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {isGracePeriod ? <AlertTriangle className="h-7 w-7" /> : <CalendarDays className="h-7 w-7" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1F150C]">
                {isGracePeriod ? 'Masa Sewa Telah Habis!' : 'Masa Sewa Hampir Habis!'}
              </h3>
              <p className="text-xs text-[#7a6247] leading-relaxed px-2">
                {isGracePeriod ? (
                  <>
                    Masa sewa kamar <strong>{activeReminder.room?.name || 'Kost'}</strong> Anda telah habis sejak tanggal <strong>{String(activeReminder.check_out).slice(0, 10)}</strong>. 
                    <br />
                    Batas waktu tersisa adalah <strong>{3 + daysLeft} hari lagi</strong> sebelum kamar dikosongkan secara otomatis.
                  </>
                ) : (
                  <>
                    Masa sewa kamar <strong>{activeReminder.room?.name || 'Kost'}</strong> Anda akan berakhir dalam <strong>{daysLeft} hari lagi</strong> (pada tanggal <strong>{String(activeReminder.check_out).slice(0, 10)}</strong>).
                  </>
                )}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-[#412D15] text-[#E1DCC9] hover:bg-[#2e1e0a] transition cursor-pointer shadow-sm"
              >
                Ya, Perpanjang Sewa
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="w-full py-3 rounded-2xl text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer"
              >
                {isGracePeriod ? 'Tidak, Kosongkan Kamar' : 'Nanti Saja'}
              </button>
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="space-y-4 pt-3">
            <h3 className="text-base font-bold text-[#1F150C] text-center">Pilih Durasi Perpanjangan</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#7a6247] mb-1.5">Durasi Sewa Baru</label>
                <select
                  value={renewalMonths}
                  onChange={(e) => setRenewalMonths(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D8D0BE] focus:outline-none focus:ring-2 focus:ring-[#B0BA99] bg-[#F7F4EE]"
                >
                  <option value={1}>1 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan (1 Tahun)</option>
                </select>
              </div>

              <div className="rounded-2xl bg-[#FDFCF9] border border-[#D8D0BE]/60 p-3.5 text-center">
                <p className="text-[10px] text-[#7a6247] uppercase tracking-wide font-semibold">Estimasi Total Biaya</p>
                <p className="text-base font-extrabold text-[#412D15] mt-0.5">
                  Rp {(Number(activeReminder.room?.price || 0) * Number(renewalMonths)).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="flex-1 py-3 rounded-2xl text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleRequestRenewal}
                className="flex-1 py-3 rounded-2xl text-xs font-bold bg-[#412D15] text-[#E1DCC9] hover:bg-[#2e1e0a] transition cursor-pointer shadow-sm"
              >
                Kirim Permintaan
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center pt-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1F150C]">Permintaan Dikirim!</h3>
              <p className="text-xs text-[#7a6247] leading-relaxed px-4">
                Permintaan perpanjangan sewa kamar <strong>{activeReminder.room?.name}</strong> selama <strong>{renewalMonths} bulan</strong> berhasil diajukan ke Pak RT. 
                <br />
                <span className="text-[10px] mt-1.5 block">Silakan tunggu konfirmasi dari pengelola kost.</span>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-[#412D15] text-[#E1DCC9] hover:bg-[#2e1e0a] transition cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
