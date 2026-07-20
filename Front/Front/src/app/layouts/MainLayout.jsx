import { useState, useEffect } from 'react'
import { Building2, Menu, X, Sun, Moon, Home, Search, LayoutDashboard, Calendar, CreditCard, HelpCircle, User, LogOut, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { ChatWidget } from '../components/ChatWidget'

export function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Cari Kost', href: '/rooms', icon: Search },
  ]

  if (user) {
    if (user.role === 'admin') {
      links.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard })
    } else {
      links.push(
        { name: 'Booking Saya', href: '/?tab=bookings', icon: Calendar },
        { name: 'Pembayaran', href: '/?tab=payments', icon: CreditCard },
        { name: 'Bantuan', href: '/?tab=help', icon: HelpCircle },
        { name: 'Profil', href: '/?tab=profile', icon: User }
      )
    }
  }

  const currentPath = window.location.pathname
  const currentSearch = window.location.search

  const isActive = (item) => {
    if (item.href === '/') return currentPath === '/' && !currentSearch
    if (item.href.startsWith('/?')) {
      const itemTab = new URLSearchParams(item.href.split('?')[1]).get('tab')
      const currentTab = new URLSearchParams(currentSearch).get('tab')
      return currentPath === '/' && itemTab === currentTab
    }
    return currentPath === item.href
  }

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: 'var(--background)' }}
    >
      {/* ───── FLOATING NAVBAR ───── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
      >
        <nav
          className="pointer-events-auto w-full max-w-6xl flex items-center justify-between gap-4 px-5 py-3 rounded-2xl transition-all duration-300 border"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: scrolled
              ? '0 10px 30px -10px rgba(0,0,0,0.1)'
              : '0 4px 20px -10px rgba(0,0,0,0.05)',
          }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group pointer-events-auto" aria-label="Kost Pak RT Beranda">
            <img
              src="/logo.png"
              alt="Kost Pak RT"
              className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-none" style={{ color: 'var(--foreground)' }}>Kost Pak RT</span>
              <span className="hidden 2xl:block text-[10px] mt-0.5" style={{ color: 'var(--primary)' }}>Sewa kost syariah</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className="relative flex items-center justify-center gap-1 xl:gap-1.5 p-1.5 xl:px-2.5 xl:py-1.5 rounded-xl text-[10px] xl:text-[11px] font-bold tracking-wider uppercase transition-all duration-300 whitespace-nowrap"
                  style={{
                    color: isActive(item) ? 'var(--primary)' : 'var(--muted-foreground)',
                    background: isActive(item) ? 'var(--secondary)' : 'transparent',
                    border: isActive(item) ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(item)) {
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(107,143,113,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item)) {
                      e.currentTarget.style.color = 'var(--muted-foreground)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {Icon && <Icon className="h-4 w-4 xl:h-3.5 xl:w-3.5 shrink-0" />}
                  <span className="hidden xl:inline">{item.name}</span>
                </a>
              )
            })}
          </div>

          {/* Theme Toggle + CTA Area */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer border"
              style={{
                color: 'var(--foreground)',
                background: 'var(--secondary)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--secondary)' }}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
                  style={{
                    background: 'var(--secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden xl:block text-xs font-bold tracking-wide truncate max-w-[80px]" title={user.name}>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Keluar"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer border shrink-0 whitespace-nowrap"
                  style={{
                    color: 'var(--destructive)',
                    background: 'transparent',
                    borderColor: 'rgba(192,57,43,0.3)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--destructive)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = 'var(--destructive)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--destructive)';
                    e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)';
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <>
                {/* Masuk — outline */}
                <a
                  href="/login"
                  className="px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-[10px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-300 border"
                  style={{
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.color = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--foreground)' }}
                >
                  Masuk
                </a>
                {/* Daftar — solid */}
                <a
                  href="/register"
                  className="px-2.5 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-[10px] xl:text-xs font-bold tracking-wider uppercase transition-all duration-300 text-white border border-transparent"
                  style={{
                    background: 'var(--primary)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)' }}
                >
                  Daftar
                </a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer border"
              style={{
                color: 'var(--foreground)',
                background: 'var(--secondary)',
                borderColor: 'var(--border)',
              }}
              aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer border"
              style={{
                color: 'var(--foreground)',
                background: 'var(--secondary)',
                borderColor: 'var(--border)',
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="pointer-events-auto absolute top-[76px] left-4 right-4 rounded-2xl p-4 space-y-1 border"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
            }}
          >
            {links.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200"
                  style={{
                    color: isActive(item) ? 'var(--primary)' : 'var(--muted-foreground)',
                    background: isActive(item) ? 'var(--secondary)' : 'transparent',
                    border: isActive(item) ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </a>
              )
            })}
            <div className="pt-3 flex gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-center cursor-pointer border"
                  style={{
                    color: 'var(--destructive)',
                    background: 'transparent',
                    borderColor: 'rgba(192,57,43,0.3)',
                  }}
                >
                  Keluar
                </button>
              ) : (
                <>
                  <a
                    href="/login"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-center border"
                    style={{
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                      background: 'transparent',
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Masuk
                  </a>
                  <a
                    href="/register"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-center text-white border border-transparent"
                    style={{
                      background: 'var(--primary)',
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Daftar
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content — add top padding for the floating navbar */}
      <main className="flex-1 pt-24">{children}</main>

      <ChatWidget />

      {/* ───── FOOTER ───── */}
      <footer
        style={{
          background: 'var(--secondary)',
          borderTop: '1px solid var(--border)',
        }}
        className="mt-16"
      >
        <div className="container-app py-12 md:py-14">
          <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:col-span-2 border-b border-border/60 pb-8 md:border-b-0 md:pb-0">
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="/logo.png"
                  alt="Kost Pak RT"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <span className="block text-sm font-bold leading-none" style={{ color: 'var(--foreground)' }}>Kost Pak RT</span>
                  <span className="block text-[10px] mt-0.5" style={{ color: 'var(--primary)' }}>Hunian Syariah Pekanbaru</span>
                </div>
              </div>
              <p className="text-sm max-w-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Platform booking kost syariah modern. Hunian nyaman, lokasi strategis, fasilitas lengkap.
              </p>
              
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>+62 852-7191-9117</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    Jl. Letjend. S.Parman, Gg. Al-Khalish No.18A, Cinta Raja, Sail, Kota Pekanbaru, Riau 28127
                  </span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://wa.me/6285271919117"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-border/80 text-muted-foreground hover:text-primary hover:border-primary hover:scale-105 transition-all duration-200 bg-card/40"
                  title="WhatsApp Pengelola"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                </a>
                <a
                  href="https://instagram.com/kostpakrt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-border/80 text-muted-foreground hover:text-primary hover:border-primary hover:scale-105 transition-all duration-200 bg-card/40"
                  title="Instagram Kost Pak RT"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>

            {/* Menu */}
            <div className="border-b border-border/60 pb-8 md:border-b-0 md:pb-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--primary)' }}>Menu navigasi</p>
              <ul className="space-y-3">
                {links.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-center gap-2.5 text-sm transition-all duration-200 hover:translate-x-1 group"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors duration-200" />}
                        <span>{item.name}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Map */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--primary)' }}>Lokasi Kami</p>
              <div
                className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                style={{ border: '1.5px solid var(--border)', height: '180px' }}
              >
                <iframe
                  title="Lokasi Kost Pak RT"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.659457629657!2d101.4592415!3d0.5112973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d5ae9f263cc0ab%3A0x60d6e3bd329de7d2!2sKost%20Pak%20RT!5e0!3m2!1sid!2sid!4v1719000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: isDark ? 'brightness(0.7) contrast(1.1) saturate(0.8)' : 'none' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/YXGqhuEbE9uWDLJAA"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 cursor-pointer"
                style={{ color: 'var(--primary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
              >
                <MapPin className="h-3.5 w-3.5" />
                Buka di Google Maps ↗
              </a>
            </div>

          </div>

          <p
            className="mt-10 pt-6 text-xs text-center md:text-left"
            style={{
              color: 'var(--muted-foreground)',
              borderTop: '1px solid var(--border)',
            }}
          >
            © {new Date().getFullYear()} Kost Pak RT · All rights reserved
          </p>
        </div>
      </footer>

    </div>
  )
}
