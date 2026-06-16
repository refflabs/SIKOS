import { useEffect } from 'react'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  MessageSquare,
} from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

const NAV = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, id: 'overview' },
  { name: 'Kamar', href: '/dashboard?tab=rooms', icon: Building2, id: 'rooms' },
  { name: 'Booking', href: '/dashboard?tab=bookings', icon: CalendarDays, id: 'bookings' },
  { name: 'Chat', href: '/dashboard?tab=chats', icon: MessageSquare, id: 'chats' },
  { name: 'Pengaturan', href: '/dashboard?tab=settings', icon: Settings, id: 'settings' },
]

export function AdminLayout({ children, activeTab = 'overview' }) {
  const { user, logout } = useAuth()
  const { connected, refreshSubscriptions } = useSocket()

  useEffect(() => {
    refreshSubscriptions()
  }, [refreshSubscriptions])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-white fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white text-xs font-bold">
              RT
            </span>
            <span className="text-sm font-bold">Kost Pak RT</span>
          </a>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-stone-300'}`}
              title={connected ? 'Realtime aktif' : 'Realtime offline'}
            />
            {connected ? 'Live terhubung' : 'Offline'}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <a
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </a>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate mb-3">{user?.email}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      <div className="flex-1 md:ml-60">
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-white/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <h1 className="text-sm font-semibold md:hidden">Admin</h1>
          <p className="text-sm font-semibold hidden md:block text-muted-foreground">
            Dashboard Admin
          </p>
          <div className="flex items-center gap-3 md:hidden">
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-stone-300'}`}
            />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">{children}</div>
      </div>
    </div>
  )
}
