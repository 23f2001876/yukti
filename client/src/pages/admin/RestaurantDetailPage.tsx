import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Plus,
  Loader2,
  Trash2,
  Receipt,
  Hash,
  RefreshCw,
  CreditCard,
  Pencil,
  Clock,
  Ban,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { AnalyticsTab } from './AnalyticsTab'
import { useAuth } from '@/context/AuthContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { restaurantApi } from '@/api/restaurants'
import { menuItemApi } from '@/api/menuItems'
import { categoryApi } from '@/api/categories'
import { orderApi } from '@/api/orders'
import { staffApi } from '@/api/staff'
import { billApi } from '@/api/bills'
import { formatCurrency, formatDate, getStatusBadgeClass, getCustomerDisplayName } from '@/lib/utils'
import type {
  Restaurant,
  MenuItem,
  Category,
  Order,
  OrderStatus,
  StaffMember,
  StaffRole,
  Bill,
  PaymentMethod,
} from '@/types'

function MenuTab({
  restaurantId,
  categories,
  onRefreshCategories,
}: {
  restaurantId: string
  categories: Category[]
  onRefreshCategories: () => void
}) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'unavailable'>('all')

  // Add Item Dialog
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    isAvailable: true,
  })
  const [saving, setSaving] = useState(false)

  // Edit Item Dialog
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    isAvailable: true,
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  function loadItems() {
    setLoading(true)
    menuItemApi
      .getByRestaurant(restaurantId)
      .then((r) => {
        if (r.success) setItems(r.data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadItems()
  }, [restaurantId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.categoryId) {
      alert('Please select or create a category first.')
      return
    }
    setSaving(true)
    try {
      const res = await menuItemApi.create(restaurantId, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
        categoryId: form.categoryId,
        isAvailable: form.isAvailable,
      })
      if (res.success) {
        setItems((p) => [...p, res.data])
        setShowAdd(false)
        setForm({ name: '', description: '', price: '', imageUrl: '', categoryId: '', isAvailable: true })
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add menu item.')
    } finally {
      setSaving(false)
    }
  }

  function handleStartEdit(item: MenuItem) {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      imageUrl: item.imageUrl || '',
      categoryId: item.categoryId || item.category?.id || '',
      isAvailable: item.isAvailable,
    })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingItem) return
    setSavingEdit(true)
    try {
      const res = await menuItemApi.update(restaurantId, editingItem.id, {
        name: editForm.name,
        description: editForm.description,
        price: parseFloat(editForm.price),
        imageUrl: editForm.imageUrl,
        categoryId: editForm.categoryId,
        isAvailable: editForm.isAvailable,
      })
      if (res.success) {
        setItems((prev) => prev.map((i) => (i.id === editingItem.id ? res.data : i)))
        setEditingItem(null)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update menu item.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleToggleStock(item: MenuItem) {
    setTogglingId(item.id)
    try {
      const nextAvailable = !item.isAvailable
      const res = await menuItemApi.update(restaurantId, item.id, {
        isAvailable: nextAvailable,
      })
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? res.data : i))
        )
      }
    } catch {
      alert('Failed to update availability status.')
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    try {
      await menuItemApi.delete(restaurantId, id)
      setItems((p) => p.filter((i) => i.id !== id))
    } catch {
      alert('Failed to delete menu item.')
    }
  }

  // Filter items by availability status
  const availableCount = items.filter((i) => i.isAvailable).length
  const unavailableCount = items.filter((i) => !i.isAvailable).length

  const filteredItems = items.filter((item) => {
    if (stockFilter === 'available') return item.isAvailable
    if (stockFilter === 'unavailable') return !item.isAvailable
    return true
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls: Availability Filters & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Availability Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={stockFilter === 'all' ? 'default' : 'outline'}
            className="h-8 rounded-full text-xs"
            onClick={() => setStockFilter('all')}
          >
            All Items ({items.length})
          </Button>
          <Button
            size="sm"
            variant={stockFilter === 'available' ? 'default' : 'outline'}
            className="h-8 rounded-full text-xs"
            onClick={() => setStockFilter('available')}
          >
            Available ({availableCount})
          </Button>
          <Button
            size="sm"
            variant={stockFilter === 'unavailable' ? 'default' : 'outline'}
            className="h-8 rounded-full text-xs text-destructive border-destructive/30"
            onClick={() => setStockFilter('unavailable')}
          >
            Unavailable ({unavailableCount})
          </Button>
        </div>

        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Menu Item
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          {items.length === 0
            ? "No menu items yet. Add items to build your restaurant's digital menu!"
            : 'No menu items match this filter.'}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        disabled={togglingId === item.id}
                        onClick={() => handleToggleStock(item)}
                        className="cursor-pointer"
                        title="Click to toggle availability"
                      >
                        <Badge
                          variant={item.isAvailable ? 'default' : 'secondary'}
                          className="cursor-pointer"
                        >
                          {togglingId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : item.isAvailable ? (
                            'Available'
                          ) : (
                            'Unavailable'
                          )}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary/80"
                          onClick={() => handleStartEdit(item)}
                          title="Edit Menu Item"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Menu Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a new dish or beverage to the restaurant menu.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Item Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Butter Chicken"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              {categories.length === 0 ? (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                  No categories found. Please add a category in the Categories tab first!
                </div>
              ) : (
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of flavors or ingredients"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Price (INR) *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                placeholder="250"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="addIsAvailable"
                checked={form.isAvailable}
                onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="addIsAvailable" className="text-sm font-medium cursor-pointer">
                Available for ordering immediately
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || categories.length === 0}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add to Menu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update pricing, details, and availability.</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Item Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Category *</Label>
                <select
                  value={editForm.categoryId}
                  onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of flavors or ingredients"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Price (INR) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="editIsAvailable"
                  checked={editForm.isAvailable}
                  onChange={(e) => setEditForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="editIsAvailable" className="text-sm font-medium cursor-pointer">
                  Available for ordering
                </Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Categories Tab ────────────────────────────────────────────────────────────
function CategoriesTab({
  restaurantId,
  categories,
  onRefresh,
}: {
  restaurantId: string
  categories: Category[]
  onRefresh: () => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [saving, setSaving] = useState(false)

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editDisplayOrder, setEditDisplayOrder] = useState('0')
  const [savingEdit, setSavingEdit] = useState(false)

  function handleStartEdit(cat: Category) {
    setEditingCategory(cat)
    setEditName(cat.name)
    setEditDisplayOrder(String(cat.displayOrder ?? 0))
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCategory) return
    setSavingEdit(true)
    try {
      const res = await categoryApi.update(restaurantId, editingCategory.id, {
        name: editName.trim(),
        displayOrder: parseInt(editDisplayOrder) || 0,
      })
      if (res.success) {
        onRefresh()
        setEditingCategory(null)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await categoryApi.create(restaurantId, {
        name: name.trim(),
        displayOrder: parseInt(displayOrder) || 0,
      })
      if (res.success) {
        onRefresh()
        setShowAdd(false)
        setName('')
        setDisplayOrder('0')
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoryApi.delete(restaurantId, id)
      onRefresh()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} menu categories</p>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          No categories created yet. Add categories (e.g. Starters, Main Course, Drinks) to group menu items!
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Display Order</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell>{c.displayOrder}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => handleStartEdit(c)}
                        title="Edit Category"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => handleDelete(c.id)}
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Group dishes by category on your digital menu.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Breads & Rice"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(o) => !o && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category name or display ordering.</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Category Name *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editDisplayOrder}
                  onChange={(e) => setEditDisplayOrder(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tableFilter, setTableFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Billing state from orders tab
  const [billingOrderId, setBillingOrderId] = useState<string | null>(null)
  const [activeBillModal, setActiveBillModal] = useState<Bill | null>(null)
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('UPI')
  const [settlingPayment, setSettlingPayment] = useState(false)

  function loadOrders() {
    setLoading(true)
    orderApi
      .getByRestaurant(restaurantId)
      .then((r) => {
        if (r.success) setOrders(r.data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [restaurantId])

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId)
    try {
      const res = await orderApi.updateStatus(restaurantId, orderId, newStatus)
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleGenerateBill(order: Order) {
    setBillingOrderId(order.id)
    try {
      const res = await billApi.create(restaurantId, {
        tableNumber: order.tableNumber || undefined,
        customerId: order.customerId || undefined,
        orderIds: [order.id],
      })
      if (res.success && res.data) {
        setActiveBillModal(res.data)
        loadOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate bill for this order.')
    } finally {
      setBillingOrderId(null)
    }
  }

  async function handleSettleBill(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBillModal) return
    setSettlingPayment(true)
    try {
      const res = await billApi.updatePayment(restaurantId, activeBillModal.id, {
        paymentStatus: 'Paid',
        paymentMethod: settleMethod,
      })
      if (res.success) {
        setActiveBillModal(null)
        loadOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to settle bill payment.')
    } finally {
      setSettlingPayment(false)
    }
  }

  // Extract distinct tables
  const distinctTables = Array.from(
    new Set(orders.map((o) => o.tableNumber).filter(Boolean))
  ) as string[]

  const filtered = orders.filter((o) => {
    if (tableFilter !== 'all' && o.tableNumber !== tableFilter) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls & Table Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Table filter buttons */}
          <Button
            size="sm"
            variant={tableFilter === 'all' ? 'default' : 'outline'}
            className="h-8 rounded-full text-xs"
            onClick={() => setTableFilter('all')}
          >
            All Tables
          </Button>
          {distinctTables.map((tbl) => (
            <Button
              key={tbl}
              size="sm"
              variant={tableFilter === tbl ? 'default' : 'outline'}
              className="h-8 rounded-full text-xs"
              onClick={() => setTableFilter(tbl)}
            >
              <Hash className="w-3 h-3 mr-1" /> Table {tbl}
            </Button>
          ))}
        </div>

        <Button size="sm" variant="ghost" className="h-8" onClick={loadOrders}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          No orders match the current filter.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID / Table</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead className="w-36 text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const total =
                  order.orderItems?.reduce(
                    (sum, oi) =>
                      sum + (oi.priceAtOrder || oi.menuItem?.price || 0) * oi.quantity,
                    0
                  ) ?? 0

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </div>
                      {order.tableNumber ? (
                        <Badge variant="outline" className="text-xs mt-1 bg-primary/5">
                          <Hash className="w-3 h-3 mr-0.5" /> Table {order.tableNumber}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Takeaway</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-foreground text-sm">
                            {getCustomerDisplayName(order.customer, order.tableNumber)}
                          </span>
                          {order.customer?.isGuest ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              Guest
                            </Badge>
                          ) : order.customer?.user ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-primary border-primary/30 bg-primary/5">
                              User
                            </Badge>
                          ) : null}
                        </div>
                        {order.customer?.user?.email && (
                          <div className="text-xs text-muted-foreground">
                            {order.customer.user.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {order.orderItems?.length ?? 0} item
                        {(order.orderItems?.length ?? 0) !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {order.orderItems
                          ?.map(
                            (oi) =>
                              `${oi.quantity}× ${oi.itemNameAtOrder || oi.menuItem?.name}`
                          )
                          .join(', ')}
                      </div>
                      {total > 0 && (
                        <div className="text-xs font-semibold text-primary mt-0.5">
                          {formatCurrency(total)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.bill ? (
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={order.bill.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.bill.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                          </Badge>
                          {order.bill.paymentStatus !== 'Paid' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-1.5 text-xs text-primary hover:text-primary/80 font-medium"
                              onClick={() => setActiveBillModal(order.bill!)}
                            >
                              Settle
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10 font-medium"
                          disabled={billingOrderId === order.id}
                          onClick={() => handleGenerateBill(order)}
                        >
                          {billingOrderId === order.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Receipt className="w-3 h-3 mr-1" />
                          )}
                          Generate Bill
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="h-8 text-xs rounded border border-input bg-background px-2"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Bill Settlement Modal */}
      <Dialog open={!!activeBillModal} onOpenChange={(o) => !o && setActiveBillModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Settle Bill #{activeBillModal?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Record customer payment to close this bill.
            </DialogDescription>
          </DialogHeader>

          {activeBillModal && (
            <form onSubmit={handleSettleBill} className="space-y-4">
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                {activeBillModal.tableNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Table:</span>
                    <span className="font-semibold">Table {activeBillModal.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(activeBillModal.subtotal)}</span>
                </div>
                {Number(activeBillModal.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatCurrency(activeBillModal.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total Amount:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(activeBillModal.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Card'] as PaymentMethod[]).map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={settleMethod === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettleMethod(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveBillModal(null)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={settlingPayment}>
                  {settlingPayment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Record Payment & Close Bill
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Staff Tab ─────────────────────────────────────────────────────────────────
function StaffTab({ restaurantId }: { restaurantId: string }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StaffRole>('Waiter')
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function loadStaff() {
    setLoading(true)
    staffApi
      .getByRestaurant(restaurantId)
      .then((r) => {
        if (r.success) setStaff(r.data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStaff()
  }, [restaurantId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')
    try {
      const res = await staffApi.add(restaurantId, {
        email: email.trim().toLowerCase(),
        staffRole: role,
      })
      if (res.success) {
        loadStaff()
        setShowAdd(false)
        setEmail('')
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to add staff member.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(m: StaffMember) {
    try {
      const res = await staffApi.update(restaurantId, m.id, { isActive: !m.isActive })
      if (res.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === m.id ? { ...s, isActive: !m.isActive } : s))
        )
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update staff member.')
    }
  }

  async function handleRemove(staffId: string) {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    try {
      await staffApi.remove(restaurantId, staffId)
      setStaff((p) => p.filter((s) => s.id !== staffId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove staff member.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{staff.length} staff members</p>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Staff Member
        </Button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg border-dashed">
          No staff members assigned yet.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{m.user?.name || 'User'}</div>
                    <div className="text-xs text-muted-foreground">{m.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.staffRole}</Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(m)}
                      className="cursor-pointer"
                    >
                      <Badge variant={m.isActive ? 'default' : 'secondary'}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemove(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog
        open={showAdd}
        onOpenChange={(open) => {
          setShowAdd(open)
          if (!open) setErrorMessage('')
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Assign a registered user to this restaurant using their account email.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">User Email Address *</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                required
                placeholder="e.g. waiter@gmail.com"
              />
              <p className="text-xs text-muted-foreground">
                The user must already have a Yukti account with this email address.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Role *</Label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="Waiter">Waiter (Takes orders, serves tables)</option>
                <option value="Chef">Chef (Prepares kitchen orders)</option>
                <option value="Manager">Manager (Manages operations & billing)</option>
                <option value="Owner">Owner (Full administrative control)</option>
              </select>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !email.trim()}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Assign Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Billing Tab ───────────────────────────────────────────────────────────────
function BillingTab({ restaurantId }: { restaurantId: string }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [unbilledOrders, setUnbilledOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Query table bill
  const [searchTable, setSearchTable] = useState('')
  const [openTableBill, setOpenTableBill] = useState<Bill | null>(null)
  const [tableUnbilledMatches, setTableUnbilledMatches] = useState<Order[]>([])
  const [searchingBill, setSearchingBill] = useState(false)
  const [billSearchError, setBillSearchError] = useState('')
  const [generatingForTable, setGeneratingForTable] = useState(false)

  // Settle bill dialog
  const [settlingBill, setSettlingBill] = useState<Bill | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [processingPayment, setProcessingPayment] = useState(false)

  function loadBillsAndOrders() {
    setLoading(true)
    Promise.all([
      billApi.getAll(restaurantId),
      orderApi.getByRestaurant(restaurantId).catch(() => ({ success: true, data: [] })),
    ])
      .then(([bRes, oRes]) => {
        if (bRes.success) setBills(bRes.data)
        if (oRes.success) {
          setUnbilledOrders(oRes.data.filter((o: Order) => !o.bill && o.status !== 'Cancelled'))
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBillsAndOrders()
  }, [restaurantId])

  async function handleFindOpenBill(e: React.FormEvent) {
    e.preventDefault()
    const tbl = searchTable.trim()
    if (!tbl) return
    setSearchingBill(true)
    setBillSearchError('')
    setOpenTableBill(null)
    setTableUnbilledMatches([])

    try {
      const res = await billApi.getOpen(restaurantId, { tableNumber: tbl })
      if (res.success && res.data) {
        setOpenTableBill(res.data)
      } else {
        await checkUnbilledForTable(tbl)
      }
    } catch {
      await checkUnbilledForTable(tbl)
    } finally {
      setSearchingBill(false)
    }
  }

  async function checkUnbilledForTable(tbl: string) {
    try {
      const oRes = await orderApi.getByRestaurant(restaurantId)
      if (oRes.success) {
        const matches = oRes.data.filter(
          (o: Order) => o.tableNumber === tbl && !o.bill && o.status !== 'Cancelled'
        )
        if (matches.length > 0) {
          setTableUnbilledMatches(matches)
        } else {
          setBillSearchError(`No open bill or unbilled orders found for Table ${tbl}.`)
        }
      }
    } catch {
      setBillSearchError(`No open bill found for Table ${tbl}.`)
    }
  }

  async function handleGenerateBillForTableOrders(tbl: string, ordersToBill: Order[]) {
    setGeneratingForTable(true)
    try {
      const res = await billApi.create(restaurantId, {
        tableNumber: tbl,
        orderIds: ordersToBill.map((o) => o.id),
      })
      if (res.success && res.data) {
        setTableUnbilledMatches([])
        setOpenTableBill(res.data)
        loadBillsAndOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate bill for table.')
    } finally {
      setGeneratingForTable(false)
    }
  }

  async function handleSettlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!settlingBill) return
    setProcessingPayment(true)
    try {
      const res = await billApi.updatePayment(restaurantId, settlingBill.id, {
        paymentStatus: 'Paid',
        paymentMethod,
      })
      if (res.success) {
        setSettlingBill(null)
        setOpenTableBill(null)
        loadBillsAndOrders()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to settle bill payment.')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Table Bill Lookup Card */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold">Table Bill Checkout</h3>
            <p className="text-xs text-muted-foreground">
              Search active open bills or unbilled orders for any dining table and record payment.
            </p>
          </div>
          <form onSubmit={handleFindOpenBill} className="flex gap-2 max-w-sm">
            <Input
              placeholder="Enter Table # (e.g. 1)"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
            <Button type="submit" disabled={searchingBill}>
              {searchingBill ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Bill'}
            </Button>
          </form>

          {billSearchError && (
            <p className="text-xs text-amber-600 dark:text-amber-400">{billSearchError}</p>
          )}

          {/* If open bill found */}
          {openTableBill && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Hash className="w-3 h-3 mr-1" /> Table {openTableBill.tableNumber}
                  </Badge>
                  <span className="text-xs font-semibold uppercase text-primary">
                    {openTableBill.paymentStatus}
                  </span>
                </div>
                <Button size="sm" onClick={() => setSettlingBill(openTableBill)}>
                  <CreditCard className="w-4 h-4 mr-1.5" /> Settle & Pay
                </Button>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-primary/10">
                <span className="text-sm font-medium">Grand Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(openTableBill.total)}
                </span>
              </div>
            </div>
          )}

          {/* If no open bill yet, but unbilled orders exist for this table */}
          {tableUnbilledMatches.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Found {tableUnbilledMatches.length} unbilled order(s) for Table {searchTable.trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generate the bill now to proceed with payment settlement.
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={generatingForTable}
                  onClick={() =>
                    handleGenerateBillForTableOrders(searchTable.trim(), tableUnbilledMatches)
                  }
                >
                  {generatingForTable ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Receipt className="w-4 h-4 mr-1" />
                  )}
                  Generate Table Bill
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unbilled Orders Section */}
      {unbilledOrders.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-semibold text-foreground">
                  Unbilled Orders ({unbilledOrders.length})
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                These orders have not yet been attached to a bill
              </span>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order / Table</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unbilledOrders.map((ord) => {
                    const orderTotal =
                      ord.orderItems?.reduce(
                        (sum, oi) =>
                          sum + (oi.priceAtOrder || oi.menuItem?.price || 0) * oi.quantity,
                        0
                      ) ?? 0

                    return (
                      <TableRow key={ord.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">
                            #{ord.id.slice(0, 8)}
                          </span>
                          {ord.tableNumber ? (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Table {ord.tableNumber}
                            </Badge>
                          ) : (
                            <span className="ml-2 text-xs text-muted-foreground">Takeaway</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{getCustomerDisplayName(ord.customer, ord.tableNumber)}</span>
                            {ord.customer?.isGuest ? (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                Guest
                              </Badge>
                            ) : ord.customer?.user ? (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-primary border-primary/30">
                                User
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {ord.orderItems
                            ?.map(
                              (oi) =>
                                `${oi.quantity}× ${oi.itemNameAtOrder || oi.menuItem?.name}`
                            )
                            .join(', ')}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-primary">
                          {formatCurrency(orderTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 font-medium"
                            onClick={() =>
                              handleGenerateBillForTableOrders(
                                ord.tableNumber || '',
                                [ord]
                              )
                            }
                          >
                            <Receipt className="w-3 h-3 mr-1" />
                            Generate Bill
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bills history table */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold">All Bills</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No bills generated yet.
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{b.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {b.tableNumber ? `Table ${b.tableNumber}` : 'Takeaway'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium">
                          {getCustomerDisplayName(b.customer, b.tableNumber)}
                        </span>
                        {b.customer?.isGuest ? (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            Guest
                          </Badge>
                        ) : b.customer?.user ? (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-primary border-primary/30">
                            User
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(b.subtotal)}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(b.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {b.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {b.paymentMethod || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(b.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {b.paymentStatus !== 'Paid' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-primary/40 text-primary hover:bg-primary/10 font-medium"
                          onClick={() => setSettlingBill(b)}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Settle
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Settled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Settle Payment Modal */}
      <Dialog open={!!settlingBill} onOpenChange={(o) => !o && setSettlingBill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle Bill Payment</DialogTitle>
            <DialogDescription>
              Record the customer's payment to complete the table order.
            </DialogDescription>
          </DialogHeader>

          {settlingBill && (
            <form onSubmit={handleSettlePayment} className="space-y-4">
              <div className="rounded-lg border border-border p-3 space-y-1 bg-muted/20">
                {settlingBill.tableNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Table:</span>
                    <span className="font-semibold">Table {settlingBill.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(settlingBill.subtotal)}</span>
                </div>
                {Number(settlingBill.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatCurrency(settlingBill.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="font-semibold text-foreground">Total Amount:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(settlingBill.total)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Card'] as PaymentMethod[]).map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={paymentMethod === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettlingBill(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processingPayment}>
                  {processingPayment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Payment & Mark Paid
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'menu'
  const { isAdmin } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banLoading, setBanLoading] = useState(false)

  const [showEditRestaurant, setShowEditRestaurant] = useState(false)
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '',
    imageUrl: '',
  })
  const [savingRestaurant, setSavingRestaurant] = useState(false)

  function handleStartEditRestaurant() {
    if (!restaurant) return
    setRestaurantForm({
      name: restaurant.name || '',
      description: restaurant.description || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      openingHours: restaurant.openingHours || '',
      imageUrl: restaurant.logoUrl || '',
    })
    setShowEditRestaurant(true)
  }

  async function handleSaveRestaurant(e: React.FormEvent) {
    e.preventDefault()
    if (!restaurant) return
    setSavingRestaurant(true)
    try {
      const res = await restaurantApi.update(restaurant.id, {
        name: restaurantForm.name.trim(),
        description: restaurantForm.description.trim() || undefined,
        address: restaurantForm.address.trim(),
        phone: restaurantForm.phone.trim(),
        email: restaurantForm.email.trim() || undefined,
        openingHours: restaurantForm.openingHours.trim() || undefined,
        logoUrl: restaurantForm.imageUrl.trim() || undefined,
      })
      if (res.success && res.data) {
        setRestaurant(res.data)
        setShowEditRestaurant(false)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update restaurant details.')
    } finally {
      setSavingRestaurant(false)
    }
  }

  async function handleToggleBan() {
    if (!restaurant) return
    try {
      setBanLoading(true)
      const targetBan = !restaurant.isBanned
      const res = await restaurantApi.toggleBan(restaurant.id, targetBan)
      if (res.success && res.data) {
        setRestaurant(res.data)
      } else {
        setRestaurant((prev) => prev ? { ...prev, isBanned: targetBan } : null)
      }
      setBanDialogOpen(false)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update restaurant ban status.')
    } finally {
      setBanLoading(false)
    }
  }

  function loadDetails() {
    if (!id) return
    Promise.all([
      restaurantApi.getById(id),
      categoryApi.getByRestaurant(id).catch(() => ({ success: true, data: [] })),
    ])
      .then(([rRes, cRes]) => {
        if (rRes.success) setRestaurant(rRes.data)
        if (cRes.success) setCategories(cRes.data)
      })
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDetails()
  }, [id])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  const location = useLocation()
  const backTo = location.pathname.startsWith('/admin') ? '/admin/restaurants' : '/partner/dashboard'

  if (!restaurant) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-muted-foreground">Restaurant not found.</p>
        <Link
          to={backTo}
          className={buttonVariants({ variant: 'outline', className: 'mt-4' })}
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back + Header + Edit Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={backTo}
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
              {restaurant.isBanned && <Badge variant="destructive">Banned</Badge>}
            </div>
            {restaurant.description && (
              <p className="text-muted-foreground text-sm mt-0.5">{restaurant.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant={restaurant.isBanned ? 'outline' : 'destructive'}
              size="sm"
              onClick={() => setBanDialogOpen(true)}
              className={restaurant.isBanned ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center gap-1.5' : 'flex items-center gap-1.5'}
            >
              {restaurant.isBanned ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Unban Restaurant</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  <span>Ban Restaurant</span>
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEditRestaurant}
            className="flex items-center gap-1.5"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Details</span>
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm font-medium truncate">{restaurant.address}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium truncate">{restaurant.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate">{restaurant.email || '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="text-sm font-medium truncate">{restaurant.openingHours || '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="analytics" className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders & Tables</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="menu" className="mt-4">
          <MenuTab
            restaurantId={restaurant.id}
            categories={categories}
            onRefreshCategories={loadDetails}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoriesTab
            restaurantId={restaurant.id}
            categories={categories}
            onRefresh={loadDetails}
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <OrdersTab restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <BillingTab restaurantId={restaurant.id} />
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <StaffTab restaurantId={restaurant.id} />
        </TabsContent>
      </Tabs>

      {/* Edit Restaurant Dialog */}
      <Dialog open={showEditRestaurant} onOpenChange={setShowEditRestaurant}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Restaurant Details</DialogTitle>
            <DialogDescription>
              Update your restaurant profile, contact information, and business hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRestaurant} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Restaurant Name *</Label>
              <Input
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g. Spice Route"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of flavors or atmosphere"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Address *</Label>
              <Input
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm((f) => ({ ...f, address: e.target.value }))}
                required
                placeholder="123 Food Street, Downtown"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  value={restaurantForm.phone}
                  onChange={(e) => setRestaurantForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={restaurantForm.email}
                  onChange={(e) => setRestaurantForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contact@restaurant.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Opening Hours</Label>
                <Input
                  value={restaurantForm.openingHours}
                  onChange={(e) => setRestaurantForm((f) => ({ ...f, openingHours: e.target.value }))}
                  placeholder="11:00 AM - 11:00 PM"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input
                  value={restaurantForm.imageUrl}
                  onChange={(e) => setRestaurantForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditRestaurant(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingRestaurant}>
                {savingRestaurant && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ban / Unban Confirmation Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-5 h-5 ${restaurant.isBanned ? 'text-emerald-600' : 'text-destructive'}`} />
              <DialogTitle>
                {restaurant.isBanned ? 'Unban Restaurant?' : 'Ban Restaurant?'}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {restaurant.isBanned ? (
                <span>
                  Unbanning <strong>{restaurant.name}</strong> will reinstate it on the customer browse page and allow customers to place orders again.
                </span>
              ) : (
                <span>
                  Banning <strong>{restaurant.name}</strong> will immediately hide it from customer browse pages and prevent new orders from being placed. Existing orders and staff access will remain intact.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setBanDialogOpen(false)}
              disabled={banLoading}
            >
              Cancel
            </Button>
            <Button
              variant={restaurant.isBanned ? 'default' : 'destructive'}
              onClick={handleToggleBan}
              disabled={banLoading}
              className="flex items-center gap-1.5"
            >
              {banLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{restaurant.isBanned ? 'Confirm Unban' : 'Confirm Ban'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
