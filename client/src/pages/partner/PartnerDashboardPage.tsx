import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Plus, UtensilsCrossed, ChevronRight, MapPin, Phone, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { restaurantApi } from '@/api/restaurants'
import type { Restaurant } from '@/types'

export default function PartnerDashboardPage() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await restaurantApi.getAll()
        if (res.success) {
          if (isAdmin) {
            setRestaurants(res.data)
          } else {
            const myRestaurantIds = new Set(user?.staffMemberships?.map((s) => s.restaurantId) || [])
            setRestaurants(res.data.filter((r) => myRestaurantIds.has(r.id)))
          }
        }
      } catch {

      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, isAdmin])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Restaurant Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your restaurants, menus, staff, live orders, and billing.
          </p>
        </div>
        <Button onClick={() => navigate('/partner/register')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Register New Restaurant</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        /* Empty State / Onboarding */
        <Card className="border-dashed border-2 text-center p-8 sm:p-12">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No restaurants found</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            You don't have any registered restaurants under this account yet. Put your restaurant on Yukti to start accepting orders!
          </p>
          <Button onClick={() => navigate('/partner/register')} size="lg" className="mt-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Register Your First Restaurant
          </Button>
        </Card>
      ) : (
        /* Restaurant Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => {
            const membership = user?.staffMemberships?.find((s) => s.restaurantId === restaurant.id)
            const role = isAdmin ? 'Super Admin' : membership?.staffRole || 'Staff'

            return (
              <Card
                key={restaurant.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/partner/restaurants/${restaurant.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {restaurant.logoUrl ? (
                        <img
                          src={restaurant.logoUrl}
                          alt={restaurant.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                          {role}
                        </Badge>
                      </div>
                      {restaurant.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {restaurant.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{restaurant.phone}</span>
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between text-xs font-medium">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/partner/restaurants/${restaurant.id}?tab=analytics`)
                    }}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-background border border-transparent hover:border-border"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Analytics</span>
                  </button>
                  <div className="flex items-center gap-1 text-primary">
                    <span>Manage Operations</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
