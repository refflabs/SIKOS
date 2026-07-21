import { useState } from 'react'
import { Eye, EyeOff, User, Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getAuthThemeTokens } from '../../styles/authThemeTokens'
import { useGoogleAuth } from '../../hooks/useGoogleAuth'

const ROLES = [
  { id: 'tenant', label: 'Penghuni Kost', desc: 'Booking, profil & bantuan', icon: User },
  { id: 'admin',  label: 'Admin',         desc: 'Kelola kamar & booking',   icon: Shield },
]

export function LoginPage() {
  const { login, logout } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const T = getAuthThemeTokens(isDark)

  const [selectedRole, setSelectedRole] = useState('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Gunakan hook Google Auth hasil deduplikasi
  useGoogleAuth({
    buttonId: 'googleBtn',
    isDark,
    mode: 'masuk',
    isEnabled: selectedRole === 'tenant',
    setError,
    setLoading
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      const userRole = data.user?.role

      if (selectedRole === 'admin' && userRole !== 'admin') {
        await logout()
        setError('Akun Anda tidak terdaftar sebagai Admin. Silakan masuk melalui tab Penghuni Kost.')
        setLoading(false)
        return
      }

      if (selectedRole === 'tenant' && userRole === 'admin') {
        await logout()
        setError('Akun Anda terdaftar sebagai Admin. Silakan masuk melalui tab Admin.')
        setLoading(false)
        return
      }

      window.location.href = userRole === 'admin' ? '/dashboard' : '/'
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.unverified) {
        sessionStorage.setItem('sikos_verify_email', err.response.data.email)
        if (err.response.data._debug_otp) {
          sessionStorage.setItem('sikos_verify_debug_otp', err.response.data._debug_otp)
        }
        window.location.href = '/verify'
        return
      }
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        (err.response?.status 
          ? `Terjadi kesalahan pada server (Status: ${err.response.status}). Silakan coba beberapa saat lagi.` 
          : 'Gagal terhubung ke server. Periksa koneksi internet Anda.')
      )
    } finally {
      setLoading(false)
    }
  }

  const baseInput = {
    width: '100%',
    fontSize: '0.875rem',
    borderRadius: '1rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingLeft: '2.75rem',
    paddingRight: '1rem',
    background: T.inputBg,
    border: `1.5px solid ${T.inputBorder}`,
    color: T.inputText,
    outline: 'none',
    transition: 'border-color 0.2s, background 0.2s',
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1.5" style={{ color: T.heading }}>
          Selamat datang kembali
        </h1>
        <p className="text-sm" style={{ color: T.subtext }}>
          Masuk ke akun Kost Pak RT Anda.
        </p>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((role) => {
          const Icon = role.icon
          const active = selectedRole === role.id
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => { setSelectedRole(role.id); setEmail(''); setPassword(''); setError('') }}
              className="relative flex flex-col gap-2.5 p-4 rounded-2xl text-left cursor-pointer transition-all duration-200"
              style={{
                border: `2px solid ${active ? T.roleBorderAct : T.roleBorderIdle}`,
                background: active ? T.roleBgActive : T.roleBgIdle,
                boxShadow: active ? `0 0 0 3px ${isDark ? 'rgba(176,186,153,0.15)' : 'rgba(65,45,21,0.1)'}` : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = isDark ? '#6a5040' : '#b8a898' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = T.roleBorderIdle }}
            >
              {/* Icon */}
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200"
                style={active
                  ? { background: T.roleIconActive.bg, color: T.roleIconActive.color }
                  : { background: T.roleIconIdle.bg, color: T.roleIconIdle.color, border: T.roleIconIdle.border }
                }
              >
                <Icon className="h-4 w-4" />
              </span>
              {/* Text */}
              <div>
                <p className="text-xs font-bold" style={{ color: T.roleLabel }}>{role.label}</p>
                <p className="text-[10px] mt-0.5 leading-snug" style={{ color: T.roleDesc }}>{role.desc}</p>
              </div>
              {active && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full" style={{ background: '#B0BA99' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium"
          style={{ background: T.errorBg, color: T.errorText, border: `1px solid ${T.errorBorder}` }}>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={selectedRole === 'admin' ? 'admin@kost.com' : 'email@contoh.com'}
              required autoComplete="email"
              style={baseInput}
              onFocus={e => { e.currentTarget.style.borderColor = T.inputBorderFocus; e.currentTarget.style.background = T.inputBgFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold" style={{ color: T.label }}>Password</label>
            <a href="/forgot-password" className="text-[11px] font-semibold transition-colors duration-200"
              style={{ color: T.forgotColor }}
              onMouseEnter={e => e.currentTarget.style.color = T.forgotHover}
              onMouseLeave={e => e.currentTarget.style.color = T.forgotColor}>
              Lupa password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
            <input
              id="password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              style={{ ...baseInput, paddingRight: '3rem' }}
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
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 mt-1"
          style={{
            background: loading ? T.roleBorderIdle : T.btnBg,
            color: loading ? T.subtext : T.btnText,
            boxShadow: loading ? 'none' : T.btnShadow,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)' }}}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${T.btnText} transparent ${T.btnText} ${T.btnText}` }} />
              Memproses...
            </span>
          ) : 'Masuk'}
        </button>
      </form>

      {/* Divider & Register pill (only for tenants/clients) */}
      {selectedRole !== 'admin' && (
        <>
          {/* Google Sign-in Button */}
          <div className="mt-4 flex flex-col items-center gap-2.5">
            <div id="googleBtn" className="w-full flex justify-center" />
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: T.dividerLine }} />
            <span className="text-[11px]" style={{ color: T.dividerText }}>atau</span>
            <div className="flex-1 h-px" style={{ background: T.dividerLine }} />
          </div>

          <a
            href="/register"
            className="block w-full py-3 rounded-2xl text-sm font-semibold text-center transition-all duration-200"
            style={{ background: T.outlineBg, color: T.outlineText, border: `1.5px solid ${T.outlineBorder}` }}
            onMouseEnter={e => { e.currentTarget.style.background = T.outlineBgHov; e.currentTarget.style.borderColor = T.outlineBordHov; e.currentTarget.style.color = T.outlineTextHov }}
            onMouseLeave={e => { e.currentTarget.style.background = T.outlineBg; e.currentTarget.style.borderColor = T.outlineBorder; e.currentTarget.style.color = T.outlineText }}
          >
            Belum punya akun?{' '}
            <span style={{ color: T.linkColor, fontWeight: '700' }}>Daftar sekarang</span>
          </a>
        </>
      )}
    </div>
  )
}
