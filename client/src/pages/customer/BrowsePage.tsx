import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, UtensilsCrossed, MapPin, ChevronRight, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { restaurantApi } from '@/api/restaurants'
import type { Restaurant } from '@/types'

export default function BrowsePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restaurantApi.getAll().then((res) => {
      if (res.success) setRestaurants(res.data.filter((r) => !r.isBanned))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter((r) =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Browse Restaurants</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} available</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, cuisine, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <UtensilsCrossed className="w-14 h-14 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No restaurants found</p>
          <p className="text-muted-foreground text-sm mt-1">Try a different search term</p>
          {search && (
            <Button variant="outline" className="mt-4" onClick={() => setSearch('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              onClick={() => navigate(`/restaurants/${r.id}`)}
            >
              <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                {r.logoUrl ? (
                  <img src={r.logoUrl} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed className="w-12 h-12 text-primary/40" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{r.name}</h3>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{r.address}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
