import { useEffect, useState, useRef } from 'react'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Settings,
  MessageSquare,
  Users,
  CreditCard,
  Home,
  Bell,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'sonner'
import { getSocket } from '../../realtime/socketClient'
import { RealtimeEvents, parseEnvelope } from '../../realtime/events'

const NAV = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, id: 'overview' },
  { name: 'Kamar', href: '/dashboard?tab=rooms', icon: Building2, id: 'rooms' },
  { name: 'Booking', href: '/dashboard?tab=bookings', icon: CalendarDays, id: 'bookings' },
  { name: 'Pembayaran', href: '/dashboard?tab=payments', icon: CreditCard, id: 'payments' },
  { name: 'User', href: '/dashboard?tab=users', icon: Users, id: 'users' },
  { name: 'Chat', href: '/dashboard?tab=chats', icon: MessageSquare, id: 'chats' },
  { name: 'Pengaturan', href: '/dashboard?tab=settings', icon: Settings, id: 'settings' },
  { name: 'Kembali ke Beranda', href: '/', icon: Home, id: 'home' },
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
            <img
              src="/logo.png"
              alt="Kost Pak RT"
              className="h-10 w-10 object-contain shrink-0"
            />
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
          <div>
            <h1 className="text-sm font-bold md:hidden text-primary">Admin</h1>
            <p className="text-sm font-bold hidden md:block text-muted-foreground/80 tracking-wide uppercase text-[10px]">
              Dashboard Admin &bull; <span className="text-primary font-semibold">{activeTab}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time Notifications Dropdown */}
            <AdminNotificationsDropdown isDark={isDark} S={S} />

            {/* Mobile status & logout */}
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

function formatRelativeTime(dateString) {
  const diffMs = new Date() - new Date(dateString)
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function AdminNotificationsDropdown({ isDark, S }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('sikos_admin_notifications')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const dropdownRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('sikos_admin_notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNewBooking = (envelope) => {
      const { payload } = parseEnvelope(envelope)
      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'booking',
        title: 'Pemesanan Kamar Baru',
        message: `${payload?.user_name || 'Seorang penyewa'} telah memesan Kamar ${payload?.room_name || ''}.`,
        timestamp: new Date().toISOString(),
        read: false,
        link: '/dashboard?tab=bookings'
      }
      setNotifications(prev => [newNotif, ...prev.slice(0, 49)])
      toast.info('Pemesanan Kamar Baru', {
        description: newNotif.message,
        action: {
          label: 'Lihat',
          onClick: () => { window.location.href = newNotif.link }
        }
      })
    }

    const handleStatusChanged = (envelope) => {
      const { payload } = parseEnvelope(envelope)
      let title = ''
      let msg = ''
      let type = ''
      let link = ''
      let showToast = false

      if (payload?.status === 'accepted') {
        type = 'payment'
        title = 'Pembayaran Diterima'
        msg = `Pembayaran Kamar ${payload?.room_name || ''} untuk ${payload?.user_name || ''} telah dikonfirmasi lunas.`
        link = '/dashboard?tab=payments'
        showToast = true
      } else if (payload?.status === 'rejected') {
        type = 'cancellation'
        title = 'Pemesanan Dibatalkan/Ditolak'
        msg = `Pemesanan Kamar ${payload?.room_name || ''} untuk ${payload?.user_name || ''} telah dibatalkan atau ditolak.`
        link = '/dashboard?tab=bookings'
        showToast = true
      }

      if (showToast) {
        const newNotif = {
          id: Math.random().toString(36).substring(2, 9),
          type,
          title,
          message: msg,
          timestamp: new Date().toISOString(),
          read: false,
          link
        }
        setNotifications(prev => [newNotif, ...prev.slice(0, 49)])
        
        if (type === 'payment') {
          toast.success(title, {
            description: msg,
            action: {
              label: 'Detail',
              onClick: () => { window.location.href = link }
            }
          })
        } else {
          toast.error(title, {
            description: msg,
            action: {
              label: 'Detail',
              onClick: () => { window.location.href = link }
            }
          })
        }
      }
    }

    const handleChatMessage = (envelope) => {
      const { payload: msg } = parseEnvelope(envelope)
      if (msg?.role === 'user') {
        const newNotif = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'chat',
          title: 'Pesan Chat Baru',
          message: `${msg?.senderName || 'Penyewa'}: "${msg?.text || ''}"`,
          timestamp: new Date().toISOString(),
          read: false,
          link: '/dashboard?tab=chats'
        }
        setNotifications(prev => [newNotif, ...prev.slice(0, 49)])
        toast('Pesan Chat Baru', {
          description: newNotif.message,
          action: {
            label: 'Balas',
            onClick: () => { window.location.href = newNotif.link }
          }
        })
      }
    }

    socket.on(RealtimeEvents.BOOKING_CREATED, handleNewBooking)
    socket.on(RealtimeEvents.BOOKING_STATUS_CHANGED, handleStatusChanged)
    socket.on(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleChatMessage)

    return () => {
      socket.off(RealtimeEvents.BOOKING_CREATED, handleNewBooking)
      socket.off(RealtimeEvents.BOOKING_STATUS_CHANGED, handleStatusChanged)
      socket.off(RealtimeEvents.CHAT_MESSAGE_RECEIVED, handleChatMessage)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('Semua notifikasi ditandai telah dibaca')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Semua riwayat notifikasi dihapus')
  }

  const handleNotifClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setIsOpen(false)
    window.location.href = notif.link
  }

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <CalendarDays className="h-4 w-4 text-amber-500" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-500" />
      case 'cancellation':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-stone-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-border bg-background hover:bg-secondary transition-all cursor-pointer focus:outline-none"
        style={{ borderColor: S.border, color: S.text }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border shadow-xl overflow-hidden z-50 transition-all duration-300"
          style={{
            background: isDark ? '#27312b' : '#ffffff',
            borderColor: S.border,
            color: S.text
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: S.border }}>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Notifikasi Real-time</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="p-1 hover:bg-secondary rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  style={{ color: '#6b8f71' }}
                  title="Tandai semua dibaca"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1 hover:bg-secondary rounded-lg text-xs font-semibold flex items-center gap-1 text-red-500 cursor-pointer"
                  title="Hapus semua"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y" style={{ divideColor: S.border }}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs" style={{ color: S.muted }}>
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Belum ada notifikasi baru
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 flex gap-3 text-left hover:bg-secondary/40 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-secondary/15 font-medium' : ''
                  }`}
                  style={{ borderBottom: `1px solid ${S.border}` }}
                >
                  <div className="mt-0.5 p-2 rounded-xl shrink-0 bg-secondary/10 flex items-center justify-center h-8 w-8">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-xs font-bold truncate">{notif.title}</p>
                      <span className="text-[9px] shrink-0" style={{ color: S.muted }}>
                        {formatRelativeTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs leading-normal break-words" style={{ color: notif.read ? S.muted : S.text }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}


