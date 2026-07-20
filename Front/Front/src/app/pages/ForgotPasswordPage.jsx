import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'sonner'
import { getAuthThemeTokens } from '../../styles/authThemeTokens'

export function ForgotPasswordPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const T = getAuthThemeTokens(isDark)

  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugOtp, setDebugOtp] = useState('')

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || errData.errors?.email?.[0] || 'Gagal mengirim kode OTP')
      }

      const data = await res.json()
      toast.success('Kode OTP berhasil dikirim ke email Anda.')
      
      if (data._debug_otp) {
        setDebugOtp(data._debug_otp)
      }
      setStep('reset')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(
          errData.message || 
          errData.errors?.otp?.[0] || 
          errData.errors?.password?.[0] || 
          'Gagal mereset password'
        )
      }

      toast.success('Password berhasil diperbarui! Silakan masuk.')
      window.location.href = '/login'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Back button */}
      <a
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 transition-colors duration-200"
        style={{ color: T.outlineText }}
        onMouseEnter={e => e.currentTarget.style.color = T.outlineTextHov}
        onMouseLeave={e => e.currentTarget.style.color = T.outlineText}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Login
      </a>

      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5" style={{ color: T.heading }}>
          {step === 'request' ? 'Lupa Password?' : 'Atur Ulang Password'}
        </h1>
        <p className="text-sm" style={{ color: T.subtext }}>
          {step === 'request'
            ? 'Masukkan email terdaftar untuk menerima kode verifikasi OTP.'
            : 'Masukkan kode OTP yang dikirim dan atur password baru Anda.'}
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium"
          style={{ background: T.errorBg, color: T.errorText, border: `1px solid ${T.errorBorder}` }}>
          {error}
        </div>
      )}

      {step === 'request' ? (
        /* STEP 1: Request OTP Form */
        <form onSubmit={handleRequestOtp} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
              Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                required autoComplete="email"
                className="w-full text-sm rounded-2xl py-3 pl-11 pr-4 transition-all duration-200 focus:outline-none"
                style={{
                  background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`,
                  color: T.inputText,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputBorderFocus; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60"
            style={{
              background: loading ? T.outlineBorder : T.btnBg,
              color: loading ? T.subtext : T.btnText,
              boxShadow: loading ? 'none' : T.btnShadow,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)' }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
          >
            {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
          </button>
        </form>
      ) : (
        /* STEP 2: Verify OTP & Reset Password Form */
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
              Kode OTP
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="otp" type="text" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Masukkan 6 digit OTP"
                required
                className="w-full text-sm rounded-2xl py-3 pl-11 pr-4 transition-all duration-200 focus:outline-none font-bold"
                style={{
                  background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`,
                  color: T.inputText,
                  letterSpacing: '2px',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputBorderFocus; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 karakter (Huruf Besar, Kecil & Simbol)"
                required
                className="w-full text-sm rounded-2xl py-3 pl-11 pr-12 transition-all duration-200 focus:outline-none"
                style={{
                  background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`,
                  color: T.inputText,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputBorderFocus; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 rounded-lg transition-colors duration-200"
                style={{ color: T.iconColor }}
                onMouseEnter={e => e.currentTarget.style.color = T.forgotHover}
                onMouseLeave={e => e.currentTarget.style.color = T.iconColor}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: T.subtext }}>
              Aturan password: Min. 8 karakter, wajib memiliki huruf besar, huruf kecil, dan simbol (contoh: @, #, $, dll).
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="passwordConfirmation" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="passwordConfirmation" type={showPassword ? 'text' : 'password'} value={passwordConfirmation}
                onChange={e => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="w-full text-sm rounded-2xl py-3 pl-11 pr-4 transition-all duration-200 focus:outline-none"
                style={{
                  background: T.inputBg,
                  border: `1.5px solid ${T.inputBorder}`,
                  color: T.inputText,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputBorderFocus; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 mt-2"
            style={{
              background: loading ? T.outlineBorder : T.btnBg,
              color: loading ? T.subtext : T.btnText,
              boxShadow: loading ? 'none' : T.btnShadow,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)' }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
          >
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}
