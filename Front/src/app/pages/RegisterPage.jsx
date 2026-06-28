import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

// ── InputField mengambil token T dari parent ──
function InputField({ id, name, type = 'text', value, onChange, placeholder, required, autoComplete, icon: Icon, label, minLength, T }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: focused ? T.inputFocusBorder : T.iconColor, transition: 'color 0.2s' }}
          />
        )}
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required} autoComplete={autoComplete} minLength={minLength}
          onFocus={e => { setFocused(true); e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
          onBlur={e => { setFocused(false); e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
          className="w-full text-sm rounded-2xl py-3 pr-4 transition-all duration-200 focus:outline-none"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            background: T.inputBg,
            border: `1.5px solid ${T.inputBorder}`,
            color: T.inputText,
          }}
        />
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // ── Token kontras tinggi untuk kedua mode ──
  const T = isDark ? {
    heading:          '#E1DCC9',
    subtext:          '#9a8060',
    label:            '#c8b89a',
    iconColor:        '#6a5040',
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
    dividerLine:      '#3a2a18',
    dividerText:      '#5a4030',
    outlineBorder:    '#3a2a18',
    outlineBg:        'transparent',
    outlineBgHov:     'rgba(176,186,153,0.08)',
    outlineBordHov:   '#8a7060',
    outlineText:      '#8a7060',
    outlineTextHov:   '#E1DCC9',
    linkColor:        '#B0BA99',
    successBg:        'rgba(176,186,153,0.15)',
    successText:      '#B0BA99',
  } : {
    heading:          '#1F150C',
    subtext:          '#7a6247',
    label:            '#1F150C',
    iconColor:        '#7a6247',
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
    dividerLine:      '#D8D0BE',
    dividerText:      '#b8a898',
    outlineBorder:    '#D8D0BE',
    outlineBg:        'transparent',
    outlineBgHov:     'rgba(65,45,21,0.05)',
    outlineBordHov:   '#b8a898',
    outlineText:      '#7a6247',
    outlineTextHov:   '#1F150C',
    linkColor:        '#412D15',
    successBg:        'rgba(176,186,153,0.2)',
    successText:      '#B0BA99',
  }

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side disposable email check
    const disposableDomains = [
      'mailinator.com', 'yopmail.com', '10minutemail.com', 'temp-mail.org', 
      'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com', 
      'maildrop.cc', 'mintemail.com', 'throwawaymail.com', 'tempmail.com', 
      'emailondash.com', 'generator.email', 'tempr.email', 'mailnesia.com', 'mailcatch.com'
    ]
    const emailParts = form.email.split('@')
    const domain = emailParts[1]?.toLowerCase()
    if (disposableDomains.includes(domain)) {
      setError('Email menggunakan domain temporary/disposable yang tidak diizinkan.')
      return
    }

    // Client-side phone number validation
    const phoneRegex = /^\+?[0-9]{9,15}$/
    if (!phoneRegex.test(form.phone)) {
      setError('Format nomor HP tidak valid. Hanya menerima angka dan format internasional (contoh: 08xxxxx atau +628xxxxx) dengan panjang 9-15 digit.')
      return
    }

    if (form.password !== form.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }
    setLoading(true)
    try {
      const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, password_confirmation: form.password_confirmation })
      sessionStorage.setItem('sikos_verify_email', form.email)
      if (res?._debug_otp) {
        sessionStorage.setItem('sikos_verify_debug_otp', res._debug_otp)
      }
      setSuccess(true)
      setTimeout(() => { window.location.href = '/verify' }, 1500)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        'Pendaftaran gagal. Periksa kembali data Anda.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <div className="text-center py-8 space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl"
          style={{ background: T.successBg, color: T.successText }}>
          <CheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold" style={{ color: T.heading }}>Pendaftaran berhasil!</h2>
        <p className="text-sm" style={{ color: T.subtext }}>Mengalihkan ke beranda…</p>
        <div className="h-1 rounded-full mx-auto w-32 overflow-hidden" style={{ background: T.dividerLine }}>
          <div className="h-full rounded-full animate-pulse" style={{ background: '#B0BA99', width: '60%' }} />
        </div>
      </div>
    )
  }

  const passInputStyle = {
    width: '100%',
    fontSize: '0.875rem',
    borderRadius: '1rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingLeft: '2.75rem',
    paddingRight: '2.5rem',
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
          Buat akun baru
        </h1>
        <p className="text-sm" style={{ color: T.subtext }}>
          Daftar gratis untuk mulai booking kamar kost.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2"
          style={{ background: T.errorBg, color: T.errorText, border: `1px solid ${T.errorBorder}` }}>
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fields pakai komponen InputField dengan token T */}
        <InputField id="reg-name"  name="name"  label="Nama Lengkap"    value={form.name}  onChange={handleChange} placeholder="Nama lengkap Anda"  required autoComplete="name"  icon={User}  T={T} />
        <InputField id="reg-email" name="email" type="email" label="Email" value={form.email} onChange={handleChange} placeholder="email@contoh.com"   required autoComplete="email" icon={Mail}  T={T} />
        <InputField id="reg-phone" name="phone" type="tel"   label="Nomor WhatsApp" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" autoComplete="tel"   icon={Phone} T={T} />

        {/* Password row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="Min. 8 karakter" required minLength={8} autoComplete="new-password"
                style={passInputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200"
                style={{ color: T.iconColor }}
                onMouseEnter={e => e.currentTarget.style.color = T.heading}
                onMouseLeave={e => e.currentTarget.style.color = T.iconColor}
              >
                {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="reg-pass-confirm" className="block text-xs font-semibold mb-1.5" style={{ color: T.label }}>Ulangi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: T.iconColor }} />
              <input
                id="reg-pass-confirm" name="password_confirmation" type={showConfirm ? 'text' : 'password'}
                value={form.password_confirmation} onChange={handleChange}
                placeholder="Ulangi password" required minLength={8} autoComplete="new-password"
                style={passInputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; e.currentTarget.style.background = T.inputBg }}
              />
              <button type="button" tabIndex={-1}
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200"
                style={{ color: T.iconColor }}
                onMouseEnter={e => e.currentTarget.style.color = T.heading}
                onMouseLeave={e => e.currentTarget.style.color = T.iconColor}
              >
                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 mt-1"
          style={{
            background: loading ? T.dividerLine : T.btnBg,
            color: loading ? T.subtext : T.btnText,
            boxShadow: loading ? 'none' : T.btnShadow,
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.08)' } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${T.btnText} transparent ${T.btnText} ${T.btnText}` }} />
              Mendaftarkan...
            </span>
          ) : 'Daftar Sekarang'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: T.dividerLine }} />
        <span className="text-[11px]" style={{ color: T.dividerText }}>atau</span>
        <div className="flex-1 h-px" style={{ background: T.dividerLine }} />
      </div>

      {/* Login pill button */}
      <a
        href="/login"
        className="block w-full py-3 rounded-2xl text-sm font-semibold text-center transition-all duration-200"
        style={{ background: T.outlineBg, color: T.outlineText, border: `1.5px solid ${T.outlineBorder}` }}
        onMouseEnter={e => {
          e.currentTarget.style.background = T.outlineBgHov
          e.currentTarget.style.borderColor = T.outlineBordHov
          e.currentTarget.style.color = T.outlineTextHov
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = T.outlineBg
          e.currentTarget.style.borderColor = T.outlineBorder
          e.currentTarget.style.color = T.outlineText
        }}
      >
        Sudah punya akun?{' '}
        <span style={{ color: T.linkColor, fontWeight: '700' }}>Masuk sekarang</span>
      </a>
    </div>
  )
}
