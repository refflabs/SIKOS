import { useState } from 'react'
import { Eye, EyeOff, User, Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const ROLES = [
  { id: 'tenant', label: 'Penghuni Kost', desc: 'Booking, profil & bantuan', icon: User },
  { id: 'admin',  label: 'Admin',         desc: 'Kelola kamar & booking',   icon: Shield },
]

export function LoginPage() {
  const { login, logout } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // ── Token kontras tinggi untuk kedua mode ──
  const T = isDark ? {
    heading:        '#E1DCC9',          // teks heading — putih krem
    subtext:        '#9a8060',          // teks subtitle
    label:          '#c8b89a',          // label input
    roleLabel:      '#D4C4A4',          // nama role — terang
    roleDesc:       '#6a5040',          // deskripsi role — abu gelap
    roleBgIdle:     '#261b0d',          // bg role card tidak aktif
    roleBgActive:   '#2e1e0a',          // bg role card aktif
    roleBorderIdle: '#3a2a18',
    roleBorderAct:  '#B0BA99',
    roleIconIdle:   { bg: '#1d1409', color: '#8a7060', border: '1px solid #3a2a18' },
    roleIconActive: { bg: 'linear-gradient(135deg,#B0BA99,#8a9478)', color: '#1F150C' },
    inputBg:        '#1a1208',          // input bg — sedikit lebih gelap dari card
    inputBgFocus:   '#261b0d',
    inputBorder:    '#4a3520',
    inputBorderFocus: '#B0BA99',
    inputText:      '#E1DCC9',
    inputPlaceholder: '#6a5040',
    forgotColor:    '#8a7060',
    forgotHover:    '#c8b89a',
    errorBg:        'rgba(180,50,40,0.15)',
    errorText:      '#e08070',
    errorBorder:    'rgba(180,50,40,0.3)',
    btnBg:          'linear-gradient(135deg,#B0BA99 0%,#8a9478 100%)',
    btnText:        '#1F150C',
    btnShadow:      '0 4px 16px rgba(176,186,153,0.22)',
    dividerLine:    '#3a2a18',
    dividerText:    '#5a4030',
    outlineBorder:  '#3a2a18',
    outlineBg:      'transparent',
    outlineBgHov:   'rgba(176,186,153,0.07)',
    outlineBordHov: '#8a7060',
    outlineText:    '#8a7060',
    outlineTextHov: '#E1DCC9',
    linkColor:      '#B0BA99',
  } : {
    heading:        '#1F150C',
    subtext:        '#7a6247',
    label:          '#1F150C',
    roleLabel:      '#1F150C',
    roleDesc:       '#9a8060',
    roleBgIdle:     '#F7F4EE',
    roleBgActive:   'rgba(65,45,21,0.06)',
    roleBorderIdle: '#D8D0BE',
    roleBorderAct:  '#412D15',
    roleIconIdle:   { bg: '#FDFCF9', color: '#7a6247', border: '1px solid #D8D0BE' },
    roleIconActive: { bg: 'linear-gradient(135deg,#412D15,#2e1e0a)', color: '#E1DCC9' },
    inputBg:        '#F7F4EE',
    inputBgFocus:   '#FDFCF9',
    inputBorder:    '#D8D0BE',
    inputBorderFocus: '#412D15',
    inputText:      '#1F150C',
    inputPlaceholder: '#b8a898',
    forgotColor:    '#7a6247',
    forgotHover:    '#412D15',
    errorBg:        'rgba(192,57,43,0.08)',
    errorText:      '#c0392b',
    errorBorder:    'rgba(192,57,43,0.2)',
    btnBg:          'linear-gradient(135deg,#412D15 0%,#2e1e0a 100%)',
    btnText:        '#E1DCC9',
    btnShadow:      '0 4px 16px rgba(65,45,21,0.28)',
    dividerLine:    '#D8D0BE',
    dividerText:    '#b8a898',
    outlineBorder:  '#D8D0BE',
    outlineBg:      'transparent',
    outlineBgHov:   'rgba(65,45,21,0.05)',
    outlineBordHov: '#b8a898',
    outlineText:    '#7a6247',
    outlineTextHov: '#1F150C',
    linkColor:      '#412D15',
  }

  const [selectedRole, setSelectedRole] = useState('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Email atau password salah. Coba lagi.'
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
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: isDark ? '#6a5040' : '#7a6247' }} />
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
            <a href="#" className="text-[11px] font-semibold transition-colors duration-200"
              style={{ color: T.forgotColor }}
              onMouseEnter={e => e.currentTarget.style.color = T.forgotHover}
              onMouseLeave={e => e.currentTarget.style.color = T.forgotColor}>
              Lupa password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: isDark ? '#6a5040' : '#7a6247' }} />
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
              style={{ color: isDark ? '#6a5040' : '#7a6247' }}
              onMouseEnter={e => e.currentTarget.style.color = isDark ? '#E1DCC9' : '#412D15'}
              onMouseLeave={e => e.currentTarget.style.color = isDark ? '#6a5040' : '#7a6247'}>
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
