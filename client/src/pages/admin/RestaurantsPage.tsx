import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, UtensilsCrossed, MapPin, Phone, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { restaurantApi } from '@/api/restaurants'
import type { Restaurant } from '@/types'

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to={`/admin/restaurants/${restaurant.id}`} className="block">
      <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              {restaurant.logoUrl ? (
                <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
                {restaurant.isBanned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
              </div>
              {restaurant.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{restaurant.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {restaurant.address}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {restaurant.phone}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (r: Restaurant) => void }) {
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await restaurantApi.create(form)
      if (res.success) {
        onCreated(res.data)
        onClose()
        setForm({ name: '', address: '', phone: '', email: '', description: '' })
      }
    } catch {
      setError('Failed to create restaurant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Restaurant</DialogTitle>
          <DialogDescription>Fill in the details to register a new restaurant.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="r-name">Name *</Label>
              <Input id="r-name" value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Spice Garden" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="r-address">Address *</Label>
              <Input id="r-address" value={form.address} onChange={(e) => update('address', e.target.value)} required placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-phone">Phone *</Label>
              <Input id="r-phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-email">Email</Label>
              <Input id="r-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="info@restaurant.com" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="r-desc">Description</Label>
              <Input id="r-desc" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="A short description..." />
            </div>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    restaurantApi.getAll().then((res) => {
      if (res.success) setRestaurants(res.data)
    }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1">{restaurants.length} registered</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Restaurant
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No restaurants match your search.' : 'No restaurants yet. Add one to get started!'}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Restaurant
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}

      <CreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(r) => setRestaurants((prev) => [r, ...prev])}
      />
    </div>
  )
}
