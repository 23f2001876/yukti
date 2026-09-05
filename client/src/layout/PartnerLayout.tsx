import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { UtensilsCrossed, LogOut, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

export default function PartnerLayout() {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const primaryRole = isAdmin
    ? 'Super Admin'
    : user?.staffMemberships?.[0]?.staffRole || 'Partner'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Partner Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-6">
              <Link to="/partner/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">Yukti</span>
                  <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider py-0.5">
                    Partner Portal
                  </Badge>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/partner/dashboard"
                  end
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`
                  }
                >
                  My Restaurants
                </NavLink>
                <NavLink
                  to="/partner/register"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`
                  }
                >
                  + Register Restaurant
                </NavLink>
              </nav>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-3">
              {/* If superadmin, link to superadmin panel */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 border-amber-600/30 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                >
                  <Shield className="w-3.5 h-3.5" />
                  SuperAdmin Panel
                </Button>
              )}

              {/* Back to storefront */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Customer Storefront</span>
              </Button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(user?.name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-foreground truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{primaryRole}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/20">
        <Outlet />
      </main>
    </div>
  )
}
