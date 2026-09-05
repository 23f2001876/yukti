import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { UtensilsCrossed, Search, ShoppingBag, Menu, X, LogOut, Store, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { to: '/restaurants', label: 'Browse' },
  { to: '/orders', label: 'My Orders' },
]

export default function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout, isStaff, isAdmin } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Yukti</span>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="flex-1 md:flex-none" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-muted-foreground"
                onClick={() => navigate('/restaurants')}
              >
                <Search className="w-4 h-4 mr-2" />
                Find food
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </Button>

                  {/* Partner / Admin Portal link */}
                  {isAdmin ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin/dashboard')}
                      className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 border-amber-600/30 hover:bg-amber-50"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Button>
                  ) : isStaff ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/partner/dashboard')}
                      className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-600/30"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>My Restaurant</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/partner/register')}
                      className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-medium"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Partner with Us</span>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/partner/register')}
                    className="hidden sm:inline-flex text-xs text-muted-foreground hover:text-foreground"
                  >
                    Partner with Us
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/login?tab=register')}
                  >
                    Get started
                  </Button>
                </div>
              )}

              {/* Mobile menu trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-border">
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive"
                  onClick={() => {
                    setMobileOpen(false)
                    handleLogout()
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      navigate('/login')
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      navigate('/login?tab=register')
                    }}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center">
                <UtensilsCrossed className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-sm text-foreground">Yukti Platform</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Yukti. Fresh food delivered from the finest local kitchens.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <NavLink to="/partner/dashboard" className="hover:text-foreground transition-colors">
                Restaurant Partner Portal
              </NavLink>
              <span className="opacity-40">&middot;</span>
              <NavLink to="/admin/login" className="hover:text-foreground transition-colors">
                Platform Admin
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
