import { User, Mail, Phone, Shield } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ProfileView({ user }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const D = isDark
    ? { bg: '#1f2722', card: '#27312b', header: '#323e37', border: '#323e37', text: '#f8f7f2', muted: '#9cb5a4', iconBg: '#323e37', hover: '#1f2722' }
    : { bg: '#f8f7f2', card: '#ffffff', header: '#faf8f5', border: '#d9e2d3', text: '#2f3a34', muted: '#2f3a34', iconBg: '#d9e2d3', hover: '#f0f4ee' }

  if (!user) return null

  const infoFields = [
    { icon: User,        label: 'Nama Lengkap',   value: user.name },
    { icon: Mail,        label: 'Email',          value: user.email },
    { icon: Phone,       label: 'Nomor WhatsApp', value: user.phone || '—' },
    { icon: Shield,      label: 'Status Peran',   value: user.role === 'admin' ? 'Pengelola Kost' : 'Penghuni Kost' },
  ]

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <div className="rounded-3xl p-6" style={{ background: D.card, border: `1px solid ${D.border}` }}>
      <div className="flex flex-col sm:flex-row items-center gap-5 pb-5"
        style={{ borderBottom: `1px solid ${D.border}` }}
      >
        {/* Avatar circle */}
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6b8f71, #56745c)',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(107,143,113,0.3)',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-xl font-extrabold tracking-tight" style={{ color: D.text }}>{user.name}</h3>
          <span
            className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: 'rgba(107,143,113,0.1)', color: '#6b8f71' }}
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
                style={{ background: D.iconBg, color: '#6b8f71' }}
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
  )
}
