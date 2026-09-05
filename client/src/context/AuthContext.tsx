import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { userApi } from '@/api/users'
import type { User, LoginCredentials, RegisterData, ApiResponse } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isOwner: boolean
  isStaff: boolean
  isCustomer: boolean
  canManageRestaurant: (restaurantId: string) => boolean
  login: (credentials: LoginCredentials) => Promise<ApiResponse<User>>
  register: (data: RegisterData) => Promise<ApiResponse<User>>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getMe()
      if (res.success && res.data) {
        setUser(res.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const res = await userApi.login(credentials)
    if (res.success && res.data) {
      setUser(res.data)
    }
    return res
  }

  const register = async (data: RegisterData): Promise<ApiResponse<User>> => {
    const res = await userApi.register(data)
    if (res.success && res.data) {
      setUser(res.data)
    }
    return res
  }

  const logout = async (): Promise<void> => {
    try {
      await userApi.logout()
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null)
    }
  }

  const isAuthenticated = !!user
  const isAdmin = !!user?.isAdmin
  const isOwner = !!(
    user?.isAdmin ||
    user?.staffMemberships?.some((s) => s.staffRole === 'Owner' && s.isActive)
  )
  const isStaff = !!(
    user?.isAdmin ||
    (user?.staffMemberships && user.staffMemberships.some((s) => s.isActive))
  )
  const isCustomer = !!user && !user.isAdmin && (!user.staffMemberships || user.staffMemberships.length === 0)

  const canManageRestaurant = (restaurantId: string): boolean => {
    if (!user) return false
    if (user.isAdmin) return true
    return !!user.staffMemberships?.some(
      (s) =>
        s.restaurantId === restaurantId &&
        s.isActive &&
        (s.staffRole === 'Owner' || s.staffRole === 'Manager')
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isOwner,
        isStaff,
        isCustomer,
        canManageRestaurant,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
