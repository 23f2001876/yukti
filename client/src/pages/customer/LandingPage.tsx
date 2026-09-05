import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, Star, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const HERO_FEATURES = [
  { icon: Clock, text: 'Fast Delivery' },
  { icon: Star, text: 'Top Rated' },
  { icon: MapPin, text: 'Near You' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/restaurants?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="relative flex-1 flex flex-col justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full my-auto">
        <div className="max-w-2xl mx-auto sm:mx-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Food that makes{' '}
            <span className="text-primary bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              every moment
            </span>{' '}
            special
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg">
            Discover great restaurants, explore diverse menus, and enjoy delicious food delivered right to you.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-8 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search restaurants or cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base shadow-xs"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-7">
              Search
            </Button>
          </form>

          {/* Features */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            {HERO_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
