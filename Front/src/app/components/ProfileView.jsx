import { User, Mail, Phone, ShieldCheck } from 'lucide-react'

export function ProfileView({ user }) {
  if (!user) return null

  const infoFields = [
    { icon: User, label: 'Nama Lengkap', value: user.name },
    { icon: Mail, label: 'Alamat Email', value: user.email },
    { icon: Phone, label: 'Nomor WhatsApp', value: user.phone || '—' },
    { icon: ShieldCheck, label: 'Tipe Akun', value: user.role === 'admin' ? 'Admin / Pengelola' : 'Penghuni Kost' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm max-w-2xl">
      <div className="px-6 py-5 border-b border-border bg-stone-50/50">
        <h2 className="text-lg font-bold text-foreground">Profil Pengguna</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola informasi data diri dan detail keanggotaan Anda di Kost Pak RT.
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
          <div className="h-20 w-20 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-2xl shadow-inner">
            {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {user.role === 'admin' ? 'Pengelola Kost' : 'Penghuni'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {infoFields.map((field) => {
            const Icon = field.icon
            return (
              <div key={field.label} className="flex items-start gap-4 p-3 rounded-xl hover:bg-stone-50/50 transition-colors">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 border border-stone-200/50 text-stone-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-foreground">{field.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
