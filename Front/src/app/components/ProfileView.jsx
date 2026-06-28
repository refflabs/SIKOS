import { User, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ProfileView({ user }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = { bg: '#F7F4E8', card: '#FDFCF9', header: '#f5f0e8', border: '#D8D0BE', text: '#3A342E', muted: '#7a6247', iconBg: '#E8E6BC', hover: '#f5f0e8' }

  if (!user) return null

  const infoFields = [
    { icon: User,        label: 'Nama Lengkap',   value: user.name },
    { icon: Mail,        label: 'Alamat Email',   value: user.email },
    { icon: Phone,       label: 'Nomor WhatsApp', value: user.phone || '—' },
    { icon: ShieldCheck, label: 'Tipe Akun',      value: user.role === 'admin' ? 'Admin / Pengelola' : 'Penghuni Kost' },
  ]

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : 'US'

  return (
    <div className="rounded-3xl overflow-hidden max-w-2xl" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${D.border}`, background: D.header }}>
        <h2 className="text-lg font-bold" style={{ color: D.text }}>Profil Pengguna</h2>
        <p className="text-xs mt-1" style={{ color: D.muted }}>
          Kelola informasi data diri dan detail keanggotaan Anda di Kost Pak RT.
        </p>
      </div>

      <div className="p-6">
        {/* Avatar row */}
        <div
          className="flex flex-col sm:flex-row items-center gap-6 pb-6"
          style={{ borderBottom: `1px solid ${D.border}` }}
        >
          {/* Avatar circle */}
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #412D15, #2e1e0a)',
              color: '#E1DCC9',
              boxShadow: '0 4px 16px rgba(65,45,21,0.4)',
              letterSpacing: '-0.02em',
            }}
          >
            {initials}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-extrabold tracking-tight" style={{ color: D.text }}>{user.name}</h3>
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: isDark ? 'rgba(176,186,153,0.12)' : 'rgba(176,186,153,0.2)', color: '#B0BA99' }}
            >
              {user.role === 'admin' ? 'Pengelola Kost' : 'Penghuni'}
            </span>
          </div>
        </div>

        {/* Info fields */}
        <div className="mt-5 space-y-2">
          {infoFields.map((field) => {
            const Icon = field.icon
            return (
              <div
                key={field.label}
                className="flex items-center gap-4 p-3.5 rounded-2xl transition-colors duration-200"
                style={{ background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = D.hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: D.iconBg, color: '#B0BA99' }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: D.muted }}>{field.label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: D.text }}>{field.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
