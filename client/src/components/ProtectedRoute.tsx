import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requirePartner?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requirePartner = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Checking credentials...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    const fallbackRedirect = redirectTo || (requireAdmin ? '/admin/login' : '/login')
    return <Navigate to={fallbackRedirect} state={{ from: location }} replace />
  }

  // Requires platform SuperAdmin (isAdmin === true)
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Platform Admin Access Required</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          This portal is reserved strictly for Yukti Platform Administrators. Your account does not have SuperAdmin permissions.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return to Storefront
          </Button>
          <Button onClick={() => window.location.href = '/partner/dashboard'}>
            Go to Partner Portal
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
