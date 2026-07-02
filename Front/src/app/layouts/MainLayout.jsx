import { useState, useEffect } from 'react'
import { Building2, Menu, X, Sun, Moon } from 'lucide-react'
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
    { name: 'Beranda', href: '/' },
    { name: 'Cari Kost', href: '/rooms' },
  ]

  if (user) {
    if (user.role === 'admin') {
      links.push({ name: 'Dashboard', href: '/dashboard' })
    } else {
      links.push(
        { name: 'Booking Saya', href: '/?tab=bookings' },
        { name: 'Histori Pembayaran', href: '/?tab=payments' },
        { name: 'Bantuan', href: '/?tab=help' },
        { name: 'Profil', href: '/?tab=profile' }
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
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? '#1f2722' : '#f8f7f2', transition: 'background 0.3s ease' }}>

      {/* ───── FLOATING NAVBAR ───── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
      >
        <nav
          className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-4 px-5 py-3 rounded-2xl transition-all duration-300"
          style={{
            background: isDark
              ? (scrolled ? 'rgba(39,49,43,0.97)' : 'rgba(39,49,43,0.92)')
              : (scrolled ? 'rgba(248,247,242,0.97)' : 'rgba(248,247,242,0.92)'),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: scrolled ? '0 8px 40px rgba(47,58,52,0.12), 0 1.5px 0 rgba(107,143,113,0.08) inset' : '0 4px 24px rgba(47,58,52,0.08)',
            border: isDark ? '1px solid rgba(107,143,113,0.22)' : '1px solid rgba(107,143,113,0.12)',
          }}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#6b8f71,#56745c)', boxShadow: '0 2px 8px rgba(107,143,113,0.3)' }}
            >
              <Building2 className="h-4 w-4 text-white" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-none" style={{ color: isDark ? '#f8f7f2' : '#2f3a34' }}>Kost Pak RT</span>
              <span className="block text-[10px] mt-0.5" style={{ color: '#6b8f71' }}>Sewa kost syariah</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(item) ? '#6b8f71' : (isDark ? '#f8f7f2' : '#2f3a34'),
                  background: isActive(item) ? 'rgba(107,143,113,0.12)' : 'transparent',
                  fontWeight: isActive(item) ? '600' : '500',
                }}
                onMouseEnter={e => { if (!isActive(item)) { e.currentTarget.style.color = '#6b8f71' } }}
                onMouseLeave={e => { if (!isActive(item)) { e.currentTarget.style.color = isDark ? '#f8f7f2' : '#2f3a34' } }}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Theme Toggle + CTA Area */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                color: isDark ? '#f8f7f2' : '#2f3a34',
                background: 'rgba(107,143,113,0.06)',
                border: isDark ? '1px solid rgba(107,143,113,0.22)' : '1px solid rgba(107,143,113,0.12)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,143,113,0.14)'; e.currentTarget.style.color = '#6b8f71' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(107,143,113,0.06)'; e.currentTarget.style.color = isDark ? '#f8f7f2' : '#2f3a34' }}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <>
                <span
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                  style={{ color: isDark ? '#f8f7f2' : '#2f3a34' }}
                >
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'rgba(107,143,113,0.15)',
                      color: isDark ? '#f8f7f2' : '#2f3a34',
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
                  style={{ color: '#c0392b', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(192,57,43,0.1)'}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                {/* Masuk — outline */}
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: isDark ? '#f8f7f2' : '#2f3a34',
                    border: `1px solid rgba(107,143,113,${isDark ? '0.3' : '0.2'})`,
                    background: `rgba(107,143,113,${isDark ? '0.08' : '0.05'})`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(107,143,113,0.18)'; e.currentTarget.style.color = '#6b8f71' }}
                  onMouseLeave={e => { e.currentTarget.style.background = `rgba(107,143,113,${isDark ? '0.08' : '0.05'})`; e.currentTarget.style.color = isDark ? '#f8f7f2' : '#2f3a34' }}
                >
                  Masuk
                </a>
                {/* Daftar — solid */}
                <a
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg,#6b8f71,#56745c)',
                    color: '#ffffff',
                    boxShadow: '0 2px 12px rgba(107,143,113,0.2)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
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
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                color: isDark ? '#f8f7f2' : '#2f3a34',
                background: `rgba(107,143,113,${isDark ? '0.1' : '0.06'})`,
                border: `1px solid rgba(107,143,113,${isDark ? '0.25' : '0.12'})`,
              }}
              aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                color: isDark ? '#f8f7f2' : '#2f3a34',
                background: `rgba(107,143,113,${isDark ? '0.1' : '0.06'})`,
                border: `1px solid rgba(107,143,113,${isDark ? '0.25' : '0.12'})`,
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
            className="pointer-events-auto absolute top-[76px] left-4 right-4 rounded-2xl p-4 space-y-1"
            style={{
              background: isDark ? 'rgba(39,49,43,0.97)' : 'rgba(248,247,242,0.97)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(107,143,113,0.25)' : '#d9e2d3'}`,
              boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.3)' : '0 16px 40px rgba(31,21,12,0.12)',
            }}
          >
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(item) ? '#6b8f71' : (isDark ? '#f8f7f2' : '#2f3a34'),
                  background: isActive(item) ? 'rgba(107,143,113,0.12)' : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-3 flex gap-2 border-t" style={{ borderColor: isDark ? 'rgba(107,143,113,0.25)' : '#d9e2d3' }}>
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center cursor-pointer"
                  style={{ color: '#c0392b', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)' }}
                >
                  Keluar
                </button>
              ) : (
                <>
                  <a
                    href="/login"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center"
                    style={{
                      color: isDark ? '#f8f7f2' : '#2f3a34',
                      border: `1px solid rgba(107,143,113,${isDark ? '0.3' : '0.2'})`,
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Masuk
                  </a>
                  <a
                    href="/register"
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center"
                    style={{
                      background: 'linear-gradient(135deg,#6b8f71,#56745c)',
                      color: '#ffffff',
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
          background: isDark ? '#1c2520' : '#f2f5f0',
          borderTop: `1px solid ${isDark ? 'rgba(107,143,113,0.2)' : '#d9e2d3'}`,
          transition: 'background 0.3s ease',
        }}
        className="mt-16"
      >
        <div className="container-app py-12 md:py-14">
          <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'var(--primary)' }}
                >
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>Kost Pak RT</span>
              </div>
              <p className="text-sm max-w-sm leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Platform booking kost syariah modern. Hunian nyaman, lokasi strategis, fasilitas lengkap.
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Kontak</p>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--foreground)' }}>
                +62 812-3456-7890
              </p>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Jl. Letjend. S.Parman, Gg. Al-Khalish No.18A<br />
                Cinta Raja, Sail, Kota Pekanbaru, Riau 28127
              </p>
            </div>

            {/* Menu */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>Menu</p>
              <ul className="space-y-2">
                {links.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>Lokasi Kami</p>
              <div
                className="relative rounded-xl overflow-hidden"
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
                className="mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer"
                style={{ color: 'var(--primary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--primary)'}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Buka di Google Maps ↗
              </a>
            </div>

          </div>

          <p
            className="mt-10 pt-6 text-xs"
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
