import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from 'react-router-dom'

// Layouts
import { AdminLayout, CustomerLayout, PartnerLayout } from '@/layout'

// Pages
import {
  LandingPage,
  BrowsePage,
  RestaurantMenuPage,
  MyOrdersPage,
  CustomerLoginPage,
  AdminLoginPage,
  DashboardPage,
  RestaurantsPage,
  RestaurantDetailPage,
  UsersPage,
  PartnerDashboardPage,
  RegisterRestaurantPage,
} from '@/pages'

import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ── Customer Storefront ────────────────────────── */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="restaurants" element={<BrowsePage />} />
        <Route path="restaurants/:id" element={<RestaurantMenuPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
      </Route>
      <Route path="/login" element={<CustomerLoginPage />} />

      {/* ── Restaurant Partner Portal ──────────────────── */}
      <Route
        path="/partner"
        element={
          <ProtectedRoute requirePartner>
            <PartnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="dashboard" element={<PartnerDashboardPage />} />
        <Route path="register" element={<RegisterRestaurantPage />} />
        <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
      </Route>

      {/* Alias for registering a restaurant */}
      <Route path="/register-restaurant" element={<Navigate to="/partner/register" replace />} />

      {/* ── Platform SuperAdmin Portal ─────────────────── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
)

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
