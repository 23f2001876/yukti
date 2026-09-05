import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Clock, UtensilsCrossed, Hash } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { orderApi } from '@/api/orders'
import { customerApi } from '@/api/customers'
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils'
import type { Order } from '@/types'

interface StoredOrderRef {
  id: string
  restaurantId: string
  restaurantName?: string
  tableNumber?: string
  createdAt: string
  total?: number
  status?: string
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const guestCustomerId = localStorage.getItem('yukti_guest_customer_id')

      // 1. Try to fetch orders directly for the guest customer ID if present
      if (guestCustomerId) {
        try {
          const res = await customerApi.getOrders(guestCustomerId)
          if (res.success && res.data && res.data.length > 0) {
            setOrders(res.data)
            setLoading(false)
            return
          }
        } catch {
          // Fall through to stored orders lookup
        }
      }

      const stored: StoredOrderRef[] = JSON.parse(
        localStorage.getItem('yukti_my_orders') || '[]'
      )

      if (stored.length === 0) {
        setLoading(false)
        return
      }

      // 2. Fetch live details for tracked order refs
      const fetched: Order[] = []
      for (const item of stored.slice(0, 20)) {
        try {
          if (item.restaurantId && item.id) {
            const res = await orderApi.getById(item.restaurantId, item.id)
            if (res.success && res.data) {
              fetched.push(res.data)
            }
          }
        } catch {
          // If fetch fails (e.g. offline), reconstruct from stored snapshot
          fetched.push({
            id: item.id,
            restaurant: { id: item.restaurantId, name: item.restaurantName || 'Restaurant' } as any,
            tableNumber: item.tableNumber,
            status: (item.status as any) || 'Placed',
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
            orderItems: [],
          })
        }
      }

      setOrders(fetched)
      setLoading(false)
    }

    loadOrders()
  }, [])

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track your recent dining and takeaway orders</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No active or past orders</p>
          <p className="text-muted-foreground text-sm mt-1">
            Browse our partner restaurants and place an order!
          </p>
          <Button className="mt-6" onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const total =
              order.orderItems?.reduce(
                (sum, oi) => sum + (oi.priceAtOrder || oi.menuItem?.price || 0) * oi.quantity,
                0
              ) ?? 0

            return (
              <Card
                key={order.id}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">
                            {order.restaurant?.name ?? 'Restaurant'}
                          </p>
                          {order.tableNumber && (
                            <Badge variant="outline" className="text-xs bg-muted/40">
                              <Hash className="w-3 h-3 mr-0.5" /> Table {order.tableNumber}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.orderItems?.length ?? 0} item
                          {(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
                          {total > 0 && ` · ${formatCurrency(total)}`}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                    </div>
                  </div>

                  {/* Order items preview */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {order.orderItems
                          .map((oi) => `${oi.quantity}× ${oi.itemNameAtOrder || oi.menuItem?.name}`)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
