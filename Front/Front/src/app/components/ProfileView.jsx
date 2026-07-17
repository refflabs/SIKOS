import { User, Mail, Phone, Shield } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ProfileView({ user }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
    <div className="rounded-3xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex flex-col sm:flex-row items-center gap-5 pb-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Avatar circle */}
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
            border: '2px solid var(--border)',
            letterSpacing: '-0.02em',
          }}
        >
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>{user.name}</h3>
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
              onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--secondary)', color: '#6b8f71' }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{field.label}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{field.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit profile note */}
      <div
        className="mt-5 px-4 py-3 rounded-xl text-xs flex items-center gap-2"
        style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
      >
        <span>ℹ️</span>
        <span>Untuk mengubah data profil, hubungi pengelola via{' '}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Pak%20RT,%20saya%20ingin%20mengubah%20data%20profil%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
            style={{ color: 'var(--primary)' }}
          >
            WhatsApp
          </a>.
        </span>
      </div>
    </div>
  )
}
