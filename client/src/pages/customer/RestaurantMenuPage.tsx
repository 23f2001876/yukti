import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  ArrowLeft,
  UtensilsCrossed,
  MapPin,
  Phone,
  Clock,
  ShoppingBag,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  Hash,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { restaurantApi } from '@/api/restaurants'
import { menuItemApi } from '@/api/menuItems'
import { categoryApi } from '@/api/categories'
import { orderApi } from '@/api/orders'
import { formatCurrency, cn } from '@/lib/utils'
import type { Restaurant, MenuItem, Category, Order } from '@/types'

interface CartItem {
  menuItem: MenuItem
  quantity: number
}

function MenuItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem
  qty: number
  onAdd: () => void
  onRemove: () => void
}) {
  const isOutOfStock = !item.isAvailable

  return (
    <div className={cn('flex items-center gap-4 py-4', isOutOfStock && 'opacity-60')}>
      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <UtensilsCrossed className="w-8 h-8 text-muted-foreground/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-foreground">{item.name}</h4>
          {isOutOfStock && (
            <Badge variant="secondary" className="text-[10px]">
              Not Available
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <p className="text-sm font-semibold text-primary mt-1">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {qty > 0 ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRemove}>
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
            <Button size="icon" className="h-8 w-8" onClick={onAdd} disabled={isOutOfStock}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={onAdd} disabled={isOutOfStock}>
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        )}
      </div>
    </div>
  )
}

export default function RestaurantMenuPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [hideOutOfStock, setHideOutOfStock] = useState(false)

  // Order Placement Dialog
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [tableNumber, setTableNumber] = useState(
    searchParams.get('table') || localStorage.getItem('yukti_last_table') || ''
  )
  const [submittingOrder, setSubmittingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      restaurantApi.getById(id),
      menuItemApi.getByRestaurant(id),
      categoryApi.getByRestaurant(id).catch(() => ({ success: true, data: [] })),
    ])
      .then(([rRes, mRes, cRes]) => {
        if (rRes.success) setRestaurant(rRes.data)
        if (mRes.success) setMenuItems(mRes.data)
        if (cRes.success) setCategories(cRes.data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [id])

  function addToCart(item: MenuItem) {
    if (!item.isAvailable) return

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id)
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { menuItem: item, quantity: 1 }]
    })
  }

  function removeFromCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter((c) => c.menuItem.id !== item.id)
      return prev.map((c) =>
        c.menuItem.id === item.id ? { ...c, quantity: c.quantity - 1 } : c
      )
    })
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!id || cart.length === 0) return
    setSubmittingOrder(true)
    setOrderError('')

    try {
      const guestCustomerId = !user
        ? localStorage.getItem('yukti_guest_customer_id') || undefined
        : undefined

      const res = await orderApi.create(id, {
        customerId: guestCustomerId,
        tableNumber: tableNumber.trim() || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
        })),
      })

      if (res.success) {
        // Save table number preference for convenience
        if (tableNumber.trim()) {
          localStorage.setItem('yukti_last_table', tableNumber.trim())
        }

        // Save anonymous guest customer session ID
        if (!user) {
          const custId = res.data.customerId || res.data.customer?.id
          if (custId) {
            localStorage.setItem('yukti_guest_customer_id', custId)
          }
        }

        // Store order locally so guest/customer can review past orders
        const storedOrders = JSON.parse(localStorage.getItem('yukti_my_orders') || '[]')
        storedOrders.unshift({
          id: res.data.id,
          restaurantId: id,
          restaurantName: restaurant?.name,
          tableNumber: res.data.tableNumber,
          createdAt: res.data.createdAt,
          itemsCount: cartCount,
          total: cartTotal,
          status: res.data.status,
        })
        localStorage.setItem('yukti_my_orders', JSON.stringify(storedOrders))

        setPlacedOrder(res.data)
        setCart([])
      } else {
        setOrderError(res.message || 'Failed to place order. Please try again.')
      }
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmittingOrder(false)
    }
  }

  // Filter items by category and availability
  const filteredItems = menuItems.filter((item) => {
    if (hideOutOfStock && !item.isAvailable) return false

    if (selectedCategory === 'all') return true
    return item.category?.id === selectedCategory || item.categoryId === selectedCategory
  })

  // Group filtered by category name
  const grouped = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.category?.name ?? 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Restaurant not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/restaurants')}>
          Back to browse
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/restaurants')}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to restaurants
      </Button>

      {/* Restaurant Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
            {tableNumber && (
              <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                <Hash className="w-3 h-3 mr-1" /> Table {tableNumber}
              </Badge>
            )}
          </div>
          {restaurant.description && (
            <p className="text-muted-foreground text-sm mt-1">{restaurant.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" /> {restaurant.address}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" /> {restaurant.phone}
            </span>
            {restaurant.openingHours && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {restaurant.openingHours}
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Category Pills & Availability Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="rounded-full h-8 text-xs"
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              className="rounded-full h-8 text-xs"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Customer Availability Filter Toggle */}
        <button
          type="button"
          onClick={() => setHideOutOfStock(!hideOutOfStock)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer flex-shrink-0',
            hideOutOfStock
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-background text-muted-foreground border-input hover:text-foreground hover:bg-muted/50'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Available Only</span>
          {hideOutOfStock && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Menu List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No menu items available in this category.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-foreground mb-1">{category}</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card">
                {items.map((item) => (
                  <div key={item.id} className="px-5">
                    <MenuItemCard
                      item={item}
                      qty={cart.find((c) => c.menuItem.id === item.id)?.quantity ?? 0}
                      onAdd={() => addToCart(item)}
                      onRemove={() => removeFromCart(item)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 animate-fade-in">
          <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">{formatCurrency(cartTotal)}</p>
              </div>
              <Button size="sm" onClick={() => setShowOrderModal(true)}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Review & Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Place Order Dialog */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
            <DialogDescription>
              Review your items and specify your table number before placing the order.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Items summary */}
            <div className="max-h-48 overflow-y-auto divide-y divide-border rounded-lg border border-border p-3 text-sm">
              {cart.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{menuItem.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {quantity} × {formatCurrency(menuItem.price)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(menuItem.price * quantity)}
                  </p>
                </div>
              ))}
              <div className="pt-2 flex items-center justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Table number input */}
            <div className="space-y-1.5">
              <Label htmlFor="table-number" className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Table Number
              </Label>
              <Input
                id="table-number"
                placeholder="e.g. 4, T-1, or Counter/Takeout"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the number on your dining table so the kitchen knows where to serve.
              </p>
            </div>

            {/* Anonymous Guest vs Registered info */}
            {!user ? (
              <div className="text-xs text-muted-foreground bg-muted/40 border border-border/80 rounded-md p-2.5 flex items-center justify-between">
                <span>Ordering anonymously: <strong className="text-foreground">{tableNumber.trim() ? `Table ${tableNumber.trim()}` : 'Takeaway / Walk-in'}</strong></span>
                <Badge variant="secondary" className="text-[10px]">
                  Anonymous Guest
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-md p-2 flex items-center justify-between">
                <span>Ordering as: <strong>{user.name}</strong></span>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  Registered Diner
                </Badge>
              </div>
            )}

            {orderError && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {orderError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOrderModal(false)}
                disabled={submittingOrder}
              >
                Back to Menu
              </Button>
              <Button type="submit" disabled={submittingOrder}>
                {submittingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Placed Success Dialog */}
      <Dialog
        open={!!placedOrder}
        onOpenChange={(open) => {
          if (!open) {
            setPlacedOrder(null)
            setShowOrderModal(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <DialogTitle className="text-xl">Order Placed Successfully!</DialogTitle>
          <DialogDescription className="mt-1">
            Your order has been sent to the kitchen.
            {placedOrder?.tableNumber && (
              <span className="block font-medium text-foreground mt-1">
                Assigned to Table: {placedOrder.tableNumber}
              </span>
            )}
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              onClick={() => {
                setPlacedOrder(null)
                setShowOrderModal(false)
                navigate('/orders')
              }}
            >
              Track Order Status
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPlacedOrder(null)
                setShowOrderModal(false)
              }}
            >
              Order More Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
