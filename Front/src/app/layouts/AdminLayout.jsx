import { useEffect } from 'react'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  MessageSquare,
  Users,
  CreditCard,
} from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useTheme } from '../../context/ThemeContext'

const NAV = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, id: 'overview' },
  { name: 'Kamar', href: '/dashboard?tab=rooms', icon: Building2, id: 'rooms' },
  { name: 'Booking', href: '/dashboard?tab=bookings', icon: CalendarDays, id: 'bookings' },
  { name: 'Pembayaran', href: '/dashboard?tab=payments', icon: CreditCard, id: 'payments' },
  { name: 'User', href: '/dashboard?tab=users', icon: Users, id: 'users' },
  { name: 'Chat', href: '/dashboard?tab=chats', icon: MessageSquare, id: 'chats' },
  { name: 'Pengaturan', href: '/dashboard?tab=settings', icon: Settings, id: 'settings' },
]

export function AdminLayout({ children, activeTab = 'overview' }) {
  const { user, logout } = useAuth()
  const { connected, refreshSubscriptions } = useSocket()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const S = isDark
    ? { sidebar: '#27312b', border: '#323e37', text: '#f8f7f2', muted: '#9cb5a4', active: '#323e37', hover: '#2a3630', header: '#1f2722' }
    : { sidebar: '#faf8f5', border: '#d9e2d3', text: '#2f3a34', muted: '#6b8f71', active: '#d9e2d3', hover: 'rgba(217,226,211,0.3)', header: '#ffffff' }

  useEffect(() => {
    refreshSubscriptions()
  }, [refreshSubscriptions])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className="hidden md:flex w-64 flex-col border-r fixed inset-y-0 left-0 z-40 shadow-md transition-colors duration-300"
        style={{ background: S.sidebar, borderColor: S.border, color: S.text }}
      >
        <div className="p-6" style={{ borderBottom: `1px solid ${S.border}` }}>
          <a href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6b8f71] text-white text-xs font-extrabold shadow-inner">
              RT
            </span>
            <div>
              <span className="text-sm font-bold tracking-wide block" style={{ color: S.text }}>Kost Pak RT</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase block" style={{ color: '#6b8f71' }}>Pengelola</span>
            </div>
          </a>
          
          {/* Connection status with pulsing dot */}
          <div
            className="mt-5 flex items-center gap-2.5 text-xs rounded-2xl px-3 py-2"
            style={{ background: `${S.active}60`, border: `1px solid ${S.border}`, color: S.text }}
          >
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-300 ${
                  connected ? 'bg-emerald-400' : 'bg-[#c79a63]'
                }`}
                title={connected ? 'Realtime aktif' : 'Realtime offline'}
              />
            </span>
            <span className="font-medium tracking-wide">
              {connected ? 'Live Terhubung' : 'Koneksi Terputus'}
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-4 space-y-1.5 mt-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer"
                style={{
                  background: isActive ? S.active : 'transparent',
                  color: isActive ? S.text : `${S.text}cc`,
                  fontWeight: isActive ? '700' : '500',
                  transform: isActive ? 'translateX(6px)' : undefined,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = S.hover; e.currentTarget.style.transform = 'translateX(4px)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' } }}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? '#6b8f71' : S.muted }} />
                {item.name}
              </a>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4" style={{ borderTop: `1px solid ${S.border}`, background: `${S.active}20` }}>
          <p className="text-xs truncate mb-3 px-2 font-medium" style={{ color: `${S.text}99` }}>{user?.email}</p>
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer border"
            style={{ borderColor: S.border, color: S.text, background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = S.hover }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-30 h-16 border-b flex items-center justify-between px-6 backdrop-blur-md transition-colors duration-300"
          style={{ background: isDark ? 'rgba(39,49,43,0.85)' : 'rgba(255,255,255,0.85)', borderColor: S.border }}
        >
          <h1 className="text-sm font-bold md:hidden text-primary">Admin</h1>
          <p className="text-sm font-bold hidden md:block text-muted-foreground/80 tracking-wide uppercase text-[10px]">
            Dashboard Admin &bull; <span className="text-primary font-semibold">{activeTab}</span>
          </p>
          
          <div className="flex items-center gap-3 md:hidden">
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-stone-300'}`} />
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content wrapper with warm beige background */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto page-gradient-top">
          {children}
        </main>
      </div>
    </div>
  )
}


