import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  UtensilsCrossed, ShoppingBag, TrendingUp,
  Clock, CheckCircle2, ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { restaurantApi } from '@/api/restaurants'
import { orderApi } from '@/api/orders'
import { formatDate, getStatusBadgeClass, getCustomerDisplayName } from '@/lib/utils'
import type { Restaurant, Order } from '@/types'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: string
  loading?: boolean
}

function KpiCard({ title, value, subtitle, icon, color, loading }: KpiCardProps) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function orderStatusBadgeClass(status: string) {
  return getStatusBadgeClass(status)
}

import { userApi } from '@/api/users'
import { Users } from 'lucide-react'

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [userCount, setUserCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [rRes, uRes] = await Promise.all([
          restaurantApi.getAll(),
          userApi.getAll().catch(() => ({ success: false, data: [] })),
        ])

        if (rRes.success && rRes.data) {
          setRestaurants(rRes.data)
          const orderPromises = rRes.data.map((r) =>
            orderApi
              .getByRestaurant(r.id)
              .then((res) => (res.success ? res.data : []))
              .catch(() => [])
          )
          const allOrdersNested = await Promise.all(orderPromises)
          setOrders(allOrdersNested.flat())
        }

        if (uRes.success && Array.isArray(uRes.data)) {
          setUserCount(uRes.data.length)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeOrders = orders.filter((o) =>
    ['Placed', 'Accepted', 'Preparing', 'Ready'].includes(o.status)
  )
  const recentOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 8)

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">SuperAdmin control center for the Yukti dining network.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Restaurants"
          value={restaurants.length}
          subtitle="Total platform restaurants"
          icon={<UtensilsCrossed className="w-5 h-5 text-white" />}
          color="bg-gradient-to-br from-emerald-600 to-teal-700"
          loading={loading}
        />
        <KpiCard
          title="Registered Users"
          value={userCount}
          subtitle="Platform accounts"
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-blue-600"
          loading={loading}
        />
        <KpiCard
          title="Active Orders"
          value={activeOrders.length}
          subtitle="Currently in preparation"
          icon={<Clock className="w-5 h-5 text-white" />}
          color="bg-amber-500"
          loading={loading}
        />
        <KpiCard
          title="Total Orders"
          value={orders.length}
          subtitle="Network order volume"
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-purple-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription>Latest orders across all restaurants</CardDescription>
            </div>
            <Link to="/admin/restaurants" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              View restaurants <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6 pt-0">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getCustomerDisplayName(order.customer, order.tableNumber)}
                        </p>
                        {order.customer?.isGuest ? (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            Guest
                          </Badge>
                        ) : order.customer?.user ? (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-primary border-primary/30">
                            User
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.restaurant?.name} &middot; {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${orderStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurants List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Restaurants</CardTitle>
              <CardDescription>Quick overview</CardDescription>
            </div>
            <Link to="/admin/restaurants" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6 pt-0">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UtensilsCrossed className="w-10 h-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No restaurants yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {restaurants.slice(0, 6).map((r) => (
                  <Link
                    key={r.id}
                    to={`/admin/restaurants/${r.id}`}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.address}</p>
                    </div>
                    {r.isBanned ? (
                      <Badge variant="destructive" className="text-xs">Banned</Badge>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
