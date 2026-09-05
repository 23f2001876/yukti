import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, MapPin, Phone, Mail, Clock, Image, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { restaurantApi } from '@/api/restaurants'
import { useAuth } from '@/context/AuthContext'

export default function RegisterRestaurantPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: user?.email || '',
    openingHours: '10:00 AM - 10:00 PM',
    logoUrl: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await restaurantApi.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        openingHours: form.openingHours.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
      })

      if (res.success && res.data) {
        // Refresh AuthContext so the new Owner role is recognized
        await refreshUser()
        navigate(`/partner/restaurants/${res.data.id}`)
      } else {
        setError(res.message || 'Failed to create restaurant.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create restaurant. A restaurant with this name may already exist.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Register Your Restaurant</h1>
            <p className="text-sm text-muted-foreground">
              Partner with Yukti to reach thousands of diners and manage orders effortlessly.
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-border">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Restaurant Information</CardTitle>
          <CardDescription>
            Fill in the essential details. You will be set as the Owner and can manage your menu and staff right away.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Restaurant Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold">
                Restaurant Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Bella Italia Bistro"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description / Cuisine Summary
              </Label>
              <Input
                id="description"
                placeholder="e.g. Authentic wood-fired Neapolitan pizzas & handcrafted pastas"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="h-10"
              />
            </div>

            {/* Address & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-sm font-semibold">
                  Physical Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="address"
                    placeholder="123 Food Street, Downtown"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    required
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Contact Phone <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    required
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Email & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Business Email
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@restaurant.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-sm font-semibold">
                  Opening Hours
                </Label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="hours"
                    placeholder="10:00 AM - 10:00 PM"
                    value={form.openingHours}
                    onChange={(e) => updateField('openingHours', e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-sm font-semibold">
                Logo / Photo Image URL
              </Label>
              <div className="relative">
                <Image className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Provide a web image link for your storefront avatar.</p>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="h-10 px-6 font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Launch Restaurant <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
