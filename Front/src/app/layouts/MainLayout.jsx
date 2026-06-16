import { useState } from 'react'
import { Building2, Menu, X, MessageCircle } from 'lucide-react'
import { Button } from '../components/Button'
import { useAuth } from '../../context/AuthContext'
import { ChatWidget } from '../components/ChatWidget'

export function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

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
        { name: 'Bantuan', href: '/?tab=help' },
        { name: 'Profil', href: '/?tab=profile' }
      )
    }
  }

  const currentPath = window.location.pathname
  const currentSearch = window.location.search

  const isActive = (item) => {
    if (item.href === '/') {
      return currentPath === '/' && !currentSearch
    }
    if (item.href.startsWith('/?')) {
      const itemTab = new URLSearchParams(item.href.split('?')[1]).get('tab')
      const currentTab = new URLSearchParams(currentSearch).get('tab')
      return currentPath === '/' && itemTab === currentTab
    }
    return currentPath === item.href
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-lg shadow-[0_1px_0_rgba(28,25,23,0.04)]">
        <div className="container-app flex h-14 sm:h-16 items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-bold leading-none">Kost Pak RT</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">Sewa kost syariah</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <Button
                size="sm"
                variant="outline"
                onClick={logout}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Keluar
              </Button>
            ) : (
              <>
                <a href="/login">
                  <Button size="sm" variant="outline">
                    Masuk
                  </Button>
                </a>
                <a href="/register">
                  <Button size="sm" variant="primary">
                    Daftar
                  </Button>
                </a>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border px-4 py-4 space-y-1 bg-background">
            {links.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {user ? (
              <button
                type="button"
                className="block w-full text-left py-2.5 text-sm font-medium text-red-600 hover:text-red-700"
                onClick={() => {
                  setMobileOpen(false)
                  logout()
                }}
              >
                Keluar
              </button>
            ) : (
              <div className="flex gap-2 pt-3">
                <a href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </a>
                <a href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Daftar
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 page-gradient-top">{children}</main>

      <ChatWidget />

      <footer className="bg-surface-stone border-t border-border mt-16">
        <div className="container-app py-12 md:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <span className="font-bold">Kost Pak RT</span>
              </div>
              <p className="text-subtitle text-sm max-w-sm">
                Platform booking kost syariah modern di Jakarta.
              </p>
            </div>
            <div>
              <p className="text-label mb-3">Menu</p>
              <ul className="space-y-2">
                {links.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-label mb-3">Kontak</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jakarta Selatan
                <br />
                +62 812-3456-7890
              </p>
            </div>
          </div>
          <p className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kost Pak RT
          </p>
        </div>
      </footer>
    </div>
  )
}
