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
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: 'var(--background)' }}
    >
      {/* ───── FLOATING NAVBAR ───── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none"
      >
        <nav
          className="pointer-events-auto w-full max-w-5xl flex items-center justify-between gap-4 px-5 py-3 rounded-2xl transition-all duration-300 border"
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
              <span className="block text-[10px] mt-0.5" style={{ color: 'var(--primary)' }}>Sewa kost syariah</span>
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
                  color: isActive(item) ? 'var(--primary)' : 'var(--foreground)',
                  background: isActive(item) ? 'rgba(107,143,113,0.12)' : 'transparent',
                  fontWeight: isActive(item) ? '600' : '500',
                }}
                onMouseEnter={e => { if (!isActive(item)) { e.currentTarget.style.color = 'var(--primary)' } }}
                onMouseLeave={e => { if (!isActive(item)) { e.currentTarget.style.color = 'var(--foreground)' } }}
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
              <>
                <span
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'rgba(107,143,113,0.15)',
                      color: 'var(--primary)',
                    }}
                  >
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border"
                  style={{ color: 'var(--destructive)', background: 'transparent', borderColor: 'var(--destructive)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                {/* Masuk — outline */}
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border"
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
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 text-white"
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
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(item) ? 'var(--primary)' : 'var(--foreground)',
                  background: isActive(item) ? 'rgba(107,143,113,0.12)' : 'transparent',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-3 flex gap-2 border-t" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center cursor-pointer border"
                  style={{ color: 'var(--destructive)', background: 'transparent', borderColor: 'var(--destructive)' }}
                >
                  Keluar
                </button>
              ) : (
                <>
                  <a
                    href="/login"
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center border"
                    style={{
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Masuk
                  </a>
                  <a
                    href="/register"
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-white"
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
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
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
