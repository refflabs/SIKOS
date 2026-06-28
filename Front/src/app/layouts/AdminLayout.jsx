import { useEffect } from 'react'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  MessageSquare,
  Users,
} from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'

const NAV = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, id: 'overview' },
  { name: 'Kamar', href: '/dashboard?tab=rooms', icon: Building2, id: 'rooms' },
  { name: 'Booking', href: '/dashboard?tab=bookings', icon: CalendarDays, id: 'bookings' },
  { name: 'User', href: '/dashboard?tab=users', icon: Users, id: 'users' },
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#d9e2d3] bg-[#faf8f5] fixed inset-y-0 left-0 z-40 text-[#2f3a34] shadow-md">
        <div className="p-6 border-b border-[#d9e2d3]/60">
          <a href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6b8f71] text-white text-xs font-extrabold shadow-inner">
              RT
            </span>
            <div>
              <span className="text-sm font-bold tracking-wide text-[#2f3a34] block">Kost Pak RT</span>
              <span className="text-[10px] text-[#6b8f71] font-semibold tracking-wider uppercase block">Pengelola</span>
            </div>
          </a>
          
          {/* Connection status with pulsing dot */}
          <div className="mt-5 flex items-center gap-2.5 text-xs text-[#2f3a34]/80 bg-[#d9e2d3]/30 border border-[#d9e2d3]/40 rounded-2xl px-3 py-2">
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#d9e2d3] text-[#2f3a34] font-bold translate-x-1.5'
                    : 'text-[#2f3a34]/80 hover:bg-[#d9e2d3]/30 hover:text-[#2f3a34] hover:translate-x-1'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isActive ? 'scale-110 text-[#6b8f71]' : 'group-hover:scale-110'}`} />
                {item.name}
              </a>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#d9e2d3]/60 bg-[#d9e2d3]/10">
          <p className="text-xs text-[#2f3a34]/60 truncate mb-3 px-2 font-medium">{user?.email}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-[#d9e2d3] text-[#2f3a34] hover:bg-[#d9e2d3]/20 rounded-xl py-2 cursor-pointer transition-all duration-200 active:scale-95" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-white/70 backdrop-blur-md flex items-center justify-between px-6">
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

