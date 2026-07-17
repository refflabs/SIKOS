import { useState, useEffect } from 'react'
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'sonner'

// ── InputField mengambil token T dari parent ──
function InputField({ id, name, type = 'text', value, onChange, placeholder, required, autoComplete, icon: Icon, label, minLength, error, T }) {
  const [focused, setFocused] = useState(false)
  const isDark = T.errorText === '#e08070' // Determine theme based on errorText color token
  const errColor = error ? T.errorText : null

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5" style={{ color: error ? T.errorText : T.label }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: error ? T.errorText : (focused ? T.inputFocusBorder : T.iconColor), transition: 'color 0.2s' }}
          />
        )}
        <input
          id={id} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} required={required} autoComplete={autoComplete} minLength={minLength}
          onFocus={e => { setFocused(true); e.currentTarget.style.borderColor = error ? T.errorText : T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
          onBlur={e => { setFocused(false); e.currentTarget.style.borderColor = error ? T.errorText : T.inputBorder; e.currentTarget.style.background = T.inputBg }}
          className="w-full text-sm rounded-2xl py-3 pr-4 transition-all duration-200 focus:outline-none"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            background: T.inputBg,
            border: `1.5px solid ${error ? T.errorText : T.inputBorder}`,
            color: T.inputText,
          }}
        />
      </div>
      {error && (
        <p className="text-[10px] mt-1 font-semibold" style={{ color: T.errorText }}>{error}</p>
      )}
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
  const [errors, setErrors] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleGoogleLogin = async (response) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Gagal mendaftar menggunakan Google.')
      }

      const data = await res.json()
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.dispatchEvent(new CustomEvent('sikos:auth-changed'))

      toast.success('Berhasil mendaftar menggunakan Google!')
      window.location.href = data.user?.role === 'admin' ? '/dashboard' : '/'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initGoogle = () => {
      /* global google */
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: "1014355694630-6qd7gfhm24afa1vm67ddprcrg9g508ia.apps.googleusercontent.com",
          callback: handleGoogleLogin
        });
        
        google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { 
            theme: isDark ? "filled_black" : "outline", 
            size: "large", 
            width: 320,
            text: "signup_with",
            shape: "pill"
          }
        );
      }
    }
    
    const timer = setTimeout(initGoogle, 100)
    return () => clearTimeout(timer)
  }, [isDark])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    // Realtime validations
    if (name === 'name') {
      const nameRegex = /^[a-zA-Z\s]*$/
      if (value.length > 0 && value.trim().length < 2) {
        setErrors(prev => ({ ...prev, name: 'Nama lengkap minimal 2 karakter.' }))
      } else if (!nameRegex.test(value)) {
        setErrors(prev => ({ ...prev, name: 'Nama lengkap hanya boleh berisi huruf alfabet dan spasi.' }))
      } else {
        setErrors(prev => ({ ...prev, name: '' }))
      }
    }

    if (name === 'phone') {
      if (value) {
        try {
          // Accept both 08xx and +628xx formats for Indonesia
          const normalised = value.startsWith('0') ? '+62' + value.slice(1) : value
          const valid = isValidPhoneNumber(normalised, 'ID')
          if (!valid) {
            setErrors(prev => ({ ...prev, phone: 'Format: 08123456789 atau +6281234567890 (nomor Indonesia).' }))
          } else {
            setErrors(prev => ({ ...prev, phone: '' }))
          }
        } catch {
          setErrors(prev => ({ ...prev, phone: 'Nomor tidak valid.' }))
        }
      } else {
        setErrors(prev => ({ ...prev, phone: '' }))
      }
    }

    if (name === 'password') {
      let passError = ''
      if (value.length < 8) {
        passError = 'Password wajib minimal 8 karakter.'
      } else if (!/[A-Z]/.test(value)) {
        passError = 'Password harus mengandung minimal satu huruf besar.'
      } else if (!/[a-z]/.test(value)) {
        passError = 'Password harus mengandung minimal satu huruf kecil.'
      } else if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/~\-+=]/.test(value)) {
        passError = 'Password harus mengandung minimal satu simbol/spesial karakter.'
      }
      setErrors(prev => ({ ...prev, password: passError }))
    }

    if (name === 'password_confirmation') {
      if (form.password && value !== form.password) {
        setErrors(prev => ({ ...prev, password_confirmation: 'Konfirmasi password tidak cocok.' }))
      } else {
        setErrors(prev => ({ ...prev, password_confirmation: '' }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Clear all general errors
    setErrors({ name: '', email: '', phone: '', password: '', password_confirmation: '' })

    // Name check — letters + spaces only, min 2 chars
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(form.name.trim())) {
      setErrors(prev => ({ ...prev, name: 'Nama lengkap hanya boleh mengandung huruf alfabet dan spasi.' }))
      setError('Nama Lengkap tidak valid.')
      return
    }
    if (form.name.trim().length < 2) {
      setErrors(prev => ({ ...prev, name: 'Nama lengkap minimal 2 karakter.' }))
      setError('Nama Lengkap terlalu pendek.')
      return
    }

    // Disposable / temporary email blocklist
    const disposableDomains = [
      // Common disposable services
      'mailinator.com', 'yopmail.com', '10minutemail.com', 'temp-mail.org',
      'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'getairmail.com',
      'maildrop.cc', 'mintemail.com', 'throwawaymail.com', 'tempmail.com',
      'emailondash.com', 'generator.email', 'tempr.email', 'mailnesia.com',
      'mailcatch.com', 'trashmail.com', 'trashmail.net', 'trashmail.me',
      'trashmail.at', 'trashmail.io', 'guerrillamailblock.com', 'fakeinbox.com',
      'getnada.com', 'spamgourmet.com', 'mailnull.com', 'spamgourmet.net',
      'spamgourmet.org', 'discard.email', 'spam4.me', 'binkmail.com',
      'bob.email', 'clrmail.com', 'drdrb.net', 'fakemail.net',
      'filzmail.com', 'herp.in', 'incognitomail.com', 'jetable.fr.nf',
      'junk.to', 'kasmail.com', 'klzlk.com', 'kurzepost.de',
      'lookugly.com', 'lovemeleaveme.com', 'mailbidon.com', 'mailexpire.com',
      'mailfreeonline.com', 'mailguard.me', 'mailin8r.com', 'mailmate.com',
      'mailme24.com', 'mailmetrash.com', 'mailnew.com', 'mailnow.top',
      'mailnull.com', 'mailscrap.com', 'mailslapping.com', 'mailszip.com',
      'mailzilla.com', 'meltmail.com', 'momentics.ru', 'mt2009.com',
      'mt2014.com', 'nada.email', 'nomail.pw', 'nowmymail.com',
      'objectmail.com', 'oneoffmail.com', 'onewaymail.com', 'owlpic.com',
      'pookmail.com', 'proxymail.eu.org', 'rcpt.at', 'rklips.com',
      'rmqkr.net', 'rtrtr.com', 's0ny.net', 'safetymail.info',
      'sendspamhere.com', 'shieldedmail.com', 'shiftmail.com', 'skeefmail.com',
      'sl.pt', 'slopsbox.com', 'smellfear.com', 'snkmail.com',
      'sofimail.com', 'sogetthis.com', 'solopilenadores.com', 'spam.la',
      'spamfree24.org', 'spamgob.com', 'spaml.de', 'spamspot.com',
      'spamthis.co.uk', 'spamthisplease.com', 'superrito.com', 'suremail.info',
      'sweetxxx.de', 'tempalias.com', 'tempinbox.co.uk', 'tempinbox.com',
      'temporaryemail.net', 'temporaryinbox.com', 'thanksnospam.info',
      'thisisnotmyrealemail.com', 'throwam.com', 'throwam.net', 'tmail.com',
      'tmailinator.com', 'trash-mail.at', 'trash-mail.com', 'trash-mail.de',
      'trash-mail.io', 'trash-mail.net', 'trash2009.com', 'trash2010.com',
      'trash2011.com', 'trashdevil.com', 'trashdevil.de', 'trashemail.de',
      'trashimail.de', 'trashmail.at', 'trashmail.com', 'trashmail.de',
      'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmailer.com',
      'trillianpro.com', 'twinmail.de', 'tyldd.com', 'uggsrock.com',
      'umail.net', 'uroid.com', 'wegwerfmail.de', 'wegwerfmail.net',
      'wegwerfmail.org', 'willhackforfood.biz', 'wuzupmail.net',
      'xagloo.com', 'xemaps.com', 'xents.com', 'xmaily.com',
      'ybmwukt.com', 'yepmail.net', 'yopmail.fr', 'yopmail.gq',
      'za.com', 'zehnminuten.de', 'zehnminutenmail.de', 'zoemail.org',
      'zomg.info',
    ]
    const emailParts = form.email.split('@')
    const domain = emailParts[1]?.toLowerCase()
    if (!domain || disposableDomains.includes(domain)) {
      setErrors(prev => ({ ...prev, email: 'Email menggunakan domain temporary/disposable yang tidak diizinkan.' }))
      setError('Email domain tidak diizinkan.')
      return
    }

    // Phone — Indonesian format via libphonenumber-js
    try {
      const normalised = form.phone.startsWith('0') ? '+62' + form.phone.slice(1) : form.phone
      if (!isValidPhoneNumber(normalised, 'ID')) {
        setErrors(prev => ({ ...prev, phone: 'Nomor harus format Indonesia: 08123456789 atau +6281234567890.' }))
        setError('Nomor WhatsApp tidak valid.')
        return
      }
    } catch {
      setErrors(prev => ({ ...prev, phone: 'Nomor WhatsApp tidak dapat diverifikasi.' }))
      setError('Nomor WhatsApp tidak valid.')
      return
    }

    // Password strength check
    const password = form.password
    let passError = ''
    if (password.length < 8) {
      passError = 'Password wajib minimal 8 karakter.'
    } else if (!/[A-Z]/.test(password)) {
      passError = 'Password harus mengandung minimal satu huruf besar.'
    } else if (!/[a-z]/.test(password)) {
      passError = 'Password harus mengandung minimal satu huruf kecil.'
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/~\-+=]/.test(password)) {
      passError = 'Password harus mengandung minimal satu simbol/spesial karakter.'
    }
    
    if (passError) {
      setErrors(prev => ({ ...prev, password: passError }))
      setError(passError)
      return
    }

    if (form.password !== form.password_confirmation) {
      setErrors(prev => ({ ...prev, password_confirmation: 'Konfirmasi password tidak cocok.' }))
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
        err.response?.data?.errors?.name?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.phone?.[0] ||
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
        <InputField id="reg-name"  name="name"  label="Nama Lengkap"    value={form.name}  onChange={handleChange} placeholder="Nama lengkap Anda"  required autoComplete="name"  icon={User} error={errors.name} T={T} />
        <InputField id="reg-email" name="email" type="email" label="Email" value={form.email} onChange={handleChange} placeholder="email@contoh.com"   required autoComplete="email" icon={Mail} error={errors.email} T={T} />
        <InputField id="reg-phone" name="phone" type="tel"   label="Nomor WhatsApp" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" autoComplete="tel"   icon={Phone} error={errors.phone} T={T} />

        {/* Password row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold mb-1.5" style={{ color: errors.password ? T.errorText : T.label }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: errors.password ? T.errorText : T.iconColor }} />
              <input
                id="reg-password" name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="Min. 8 karakter" required minLength={8} autoComplete="new-password"
                style={{ ...passInputStyle, border: `1.5px solid ${errors.password ? T.errorText : T.inputBorder}` }}
                onFocus={e => { e.currentTarget.style.borderColor = errors.password ? T.errorText : T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.password ? T.errorText : T.inputBorder; e.currentTarget.style.background = T.inputBg }}
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
            {errors.password && (
              <p className="text-[10px] mt-1 font-semibold" style={{ color: T.errorText }}>{errors.password}</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="reg-pass-confirm" className="block text-xs font-semibold mb-1.5" style={{ color: errors.password_confirmation ? T.errorText : T.label }}>Ulangi</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: errors.password_confirmation ? T.errorText : T.iconColor }} />
              <input
                id="reg-pass-confirm" name="password_confirmation" type={showConfirm ? 'text' : 'password'}
                value={form.password_confirmation} onChange={handleChange}
                placeholder="Ulangi password" required minLength={8} autoComplete="new-password"
                style={{ ...passInputStyle, border: `1.5px solid ${errors.password_confirmation ? T.errorText : T.inputBorder}` }}
                onFocus={e => { e.currentTarget.style.borderColor = errors.password_confirmation ? T.errorText : T.inputFocusBorder; e.currentTarget.style.background = T.inputBgFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.password_confirmation ? T.errorText : T.inputBorder; e.currentTarget.style.background = T.inputBg }}
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
            {errors.password_confirmation && (
              <p className="text-[10px] mt-1 font-semibold" style={{ color: T.errorText }}>{errors.password_confirmation}</p>
            )}
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

      {/* Google Sign-in Button */}
      <div className="mt-4 flex flex-col items-center gap-2.5">
        <div id="googleBtn" className="w-full flex justify-center" />
      </div>

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
