import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { UtensilsCrossed, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function CustomerLoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { login, register, user } = useAuth()

  // Tab state: 'login' or 'register'
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // If already logged in, go to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' })

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab)
    setError('')
    setSearchParams(tab === 'register' ? { tab: 'register' } : {})
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email: loginForm.email.trim(), password: loginForm.password })
      if (res.success) {
        navigate('/')
      } else {
        setError(res.message || 'Login failed. Please check your credentials.')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register({
        name: regForm.name.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        phone: regForm.phone.trim() || undefined,
      })
      if (res.success) {
        navigate('/')
      } else {
        setError(res.message || 'Registration failed. Please try again.')
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. This email may already be in use.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 flex flex-col items-center justify-center px-4 py-2">
      <div className="w-full max-w-md my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-4">
          <Link to="/" className="flex flex-col items-center group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md shadow-primary/20 mb-2 transition-transform group-hover:scale-105">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Yukti</h1>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            {activeTab === 'login'
              ? 'Sign in to access your orders and account'
              : 'Create an account to start ordering meals'}
          </p>
        </div>

        {/* Card Container */}
        <Card className="shadow-lg border-border bg-card overflow-hidden">
          {/* Segmented Switcher */}
          <div className="p-1.5 bg-muted/40 border-b border-border">
            <div className="grid grid-cols-2 p-0.5 bg-muted/60 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className={cn(
                  'py-1.5 px-3 text-xs font-semibold rounded-md transition-all text-center',
                  activeTab === 'login'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={cn(
                  'py-1.5 px-3 text-xs font-semibold rounded-md transition-all text-center',
                  activeTab === 'register'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Create Account
              </button>
            </div>
          </div>

          <CardContent className="p-5 sm:p-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/10 text-destructive text-xs mb-3 animate-in fade-in-50">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* Sign In Form */
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-xs font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="login-pw" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                      className="h-10 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 text-sm font-semibold mt-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs font-medium text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Doe"
                      value={regForm.name}
                      onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                      required
                      autoComplete="name"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-phone" className="text-xs font-medium text-foreground">
                      Phone <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 98765..."
                      value={regForm.phone}
                      onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                      autoComplete="tel"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-xs font-medium text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-pw" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reg-pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={regForm.password}
                      onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      autoComplete="new-password"
                      className="h-10 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 text-sm font-semibold mt-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Admin portal redirect footer note */}
        <div className="mt-3.5 text-center">
          <p className="text-xs text-muted-foreground">
            Are you restaurant staff or admin?{' '}
            <Link to="/admin/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Admin Portal &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
