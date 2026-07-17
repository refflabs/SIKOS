import { useState, useEffect } from 'react'
import { CheckCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react'
import { verifyOTP, resendOTP } from '../../api/auth'

export function VerificationPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('sikos_verify_email') || ''
    setEmail(storedEmail)
    if (!storedEmail) {
      window.location.href = '/login'
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendSuccess('')
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Kode OTP harus berupa 6 digit angka.')
      return
    }

    setLoading(true)
    try {
      const data = await verifyOTP(email, otp)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('sikos:auth-changed'))
      sessionStorage.removeItem('sikos_verify_email')
      sessionStorage.removeItem('sikos_verify_debug_otp')
      setSuccess(true)
      setTimeout(() => {
        window.location.href = data.user?.role === 'admin' ? '/dashboard' : '/'
      }, 1500)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.otp?.[0] ||
        'Kode OTP tidak valid atau sudah kedaluwarsa.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendSuccess('')
    setResending(true)
    try {
      await resendOTP(email)
      setResendSuccess('Kode OTP baru telah dikirim ke email Anda. Periksa folder Spam jika tidak muncul.')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode OTP.')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div
          className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl"
          style={{ background: 'rgba(107,143,113,0.15)', color: 'var(--primary)' }}
        >
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: 'var(--foreground)' }}>
          Verifikasi Berhasil!
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Mempersiapkan halaman Anda…
        </p>
        {/* Progress bar */}
        <div
          className="h-1 rounded-full mx-auto w-32 overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full animate-pulse"
            style={{ background: 'var(--primary)', width: '70%' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5" style={{ color: 'var(--foreground)' }}>
          Verifikasi Akun
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Masukkan 6 digit kode yang dikirim ke{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{email}</span>.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2"
          style={{
            background: 'rgba(192,57,43,0.08)',
            color: 'var(--destructive)',
            border: '1px solid rgba(192,57,43,0.2)',
          }}
        >
          <span>⚠</span> {error}
        </div>
      )}

      {/* Resend success */}
      {resendSuccess && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2"
          style={{
            background: 'rgba(107,143,113,0.1)',
            color: 'var(--primary)',
            border: '1px solid rgba(107,143,113,0.2)',
          }}
        >
          <span className="shrink-0 mt-0.5">✓</span> {resendSuccess}
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            Kode OTP
          </label>
          <div className="relative">
            <ShieldCheck
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <input
              id="otp"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              required
              className="w-full text-sm rounded-xl py-3 pr-4 transition-all duration-200 focus:outline-none text-center font-mono text-lg tracking-[0.5em] pl-10"
              style={{
                background: 'var(--background)',
                border: '1.5px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
          }}
          onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = 'var(--primary-dark)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)' }}
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
        </button>
      </form>

      {/* Resend & Back */}
      <div className="mt-6 space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200 border cursor-pointer"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--muted-foreground)',
            background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Mengirim ulang...' : 'Kirim ulang kode OTP'}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <a
          href="/login"
          className="flex items-center justify-center gap-2 text-xs font-semibold py-1 transition-colors duration-200"
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
        >
          <ArrowLeft className="h-3 w-3" /> Kembali ke halaman masuk
        </a>
      </div>
    </div>
  )
}
