import { useState, useEffect } from 'react'
import { CheckCircle, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { verifyOTP, resendOTP } from '../../api/auth'

export function VerificationPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const T = isDark ? {
    heading:          '#E1DCC9',
    subtext:          '#9a8060',
    label:            '#c8b89a',
    inputBg:          '#1a1208',
    inputBgFocus:     '#261b0d',
    inputBorder:      '#4a3520',
    inputFocusBorder: '#B0BA99',
    inputText:        '#E1DCC9',
    errorBg:          'rgba(180,50,40,0.15)',
    errorText:        '#e08070',
    errorBorder:      'rgba(180,50,40,0.3)',
    btnBg:            'linear-gradient(135deg,#B0BA99 0%,#8a9478 100%)',
    btnText:          '#1F150C',
    btnShadow:        '0 4px 16px rgba(176,186,153,0.22)',
    successBg:        'rgba(176,186,153,0.15)',
    successText:      '#B0BA99',
    dividerLine:      '#3a2a18',
    linkColor:        '#B0BA99',
  } : {
    heading:          '#1F150C',
    subtext:          '#7a6247',
    label:            '#1F150C',
    inputBg:          '#F7F4EE',
    inputBgFocus:     '#FDFCF9',
    inputBorder:      '#D8D0BE',
    inputFocusBorder: '#412D15',
    inputText:        '#1F150C',
    errorBg:          'rgba(192,57,43,0.08)',
    errorText:        '#c0392b',
    errorBorder:      'rgba(192,57,43,0.2)',
    btnBg:            'linear-gradient(135deg,#412D15 0%,#2e1e0a 100%)',
    btnText:          '#E1DCC9',
    btnShadow:        '0 4px 16px rgba(65,45,21,0.28)',
    successBg:        'rgba(176,186,153,0.2)',
    successText:      '#B0BA99',
    dividerLine:      '#D8D0BE',
    linkColor:        '#412D15',
  }

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [debugOtp, setDebugOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('sikos_verify_email') || ''
    const storedDebugOtp = sessionStorage.getItem('sikos_verify_debug_otp') || ''
    
    setEmail(storedEmail)
    setDebugOtp(storedDebugOtp)
    
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
      
      // Save token and user info
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('sikos:auth-changed'))

      // Clear verify cache
      sessionStorage.removeItem('sikos_verify_email')
      sessionStorage.removeItem('sikos_verify_debug_otp')

      setSuccess(true)
      setTimeout(() => {
        window.location.href = data.user?.role === 'admin' ? '/dashboard' : '/'
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || 'Kode OTP tidak valid.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendSuccess('')
    setResending(true)
    try {
      const data = await resendOTP(email)
      setResendSuccess('Kode OTP baru telah dikirim ke email Anda.')
      if (data._debug_otp) {
        setDebugOtp(data._debug_otp)
        sessionStorage.setItem('sikos_verify_debug_otp', data._debug_otp)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode OTP.')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl"
          style={{ background: T.successBg, color: T.successText }}>
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: T.heading }}>Verifikasi Berhasil!</h2>
        <p className="text-sm" style={{ color: T.subtext }}>Mempersiapkan beranda Anda…</p>
        <div className="h-1 rounded-full mx-auto w-32 overflow-hidden" style={{ background: T.dividerLine }}>
          <div className="h-full rounded-full animate-pulse" style={{ background: '#B0BA99', width: '60%' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5" style={{ color: T.heading }}>
          Verifikasi Akun
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: T.subtext }}>
          Masukkan 6 digit kode verifikasi yang telah dikirim ke <span className="font-semibold" style={{ color: T.heading }}>{email}</span>.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2"
          style={{ background: T.errorBg, color: T.errorText, border: `1px solid ${T.errorBorder}` }}>
          <span>⚠</span> {error}
        </div>
      )}

      {resendSuccess && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2"
          style={{ background: 'rgba(176,186,153,0.15)', color: '#B0BA99', border: '1px solid rgba(176,186,153,0.3)' }}>
          <span>✓</span> {resendSuccess}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
            Kode OTP
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: isDark ? '#6a5040' : '#7a6247' }} />
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
              className="w-full text-sm rounded-2xl py-3 pr-4 transition-all duration-200 focus:outline-none text-center font-mono text-lg tracking-[0.5em] pl-10"
              style={{
                background: T.inputBg,
                border: `1.5px solid ${T.inputBorder}`,
                color: T.inputText,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: loading ? T.dividerLine : T.btnBg,
            color: loading ? T.subtext : T.btnText,
            boxShadow: loading ? 'none' : T.btnShadow,
          }}
          onMouseEnter={e => { if (!loading && otp.length === 6) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)' } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
        >
          {loading ? 'Verifikasi...' : 'Verifikasi Akun'}
        </button>
      </form>

      {/* Resend & Back options */}
      <div className="mt-6 space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-2xl transition-colors duration-200"
          style={{ color: T.linkColor }}
        >
          <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Mengirim ulang...' : 'Kirim ulang kode OTP'}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: T.dividerLine }} />
        </div>

        <a
          href="/login"
          className="flex items-center justify-center gap-2 text-xs font-semibold py-1 hover:underline underline-offset-4"
          style={{ color: T.subtext }}
        >
          <ArrowLeft className="h-3 w-3" /> Kembali ke halaman masuk
        </a>
      </div>
    </div>
  )
}
