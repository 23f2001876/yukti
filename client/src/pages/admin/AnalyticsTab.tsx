import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Receipt,
  Hash,
  RefreshCw,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { restaurantApi } from '@/api/restaurants'
import { formatCurrency } from '@/lib/utils'
import type { RestaurantAnalytics } from '@/types'

interface AnalyticsTabProps {
  restaurantId: string
}

type TimeRange = 'today' | '7d' | '30d' | 'all'

export function AnalyticsTab({ restaurantId }: AnalyticsTabProps) {
  const [range, setRange] = useState<TimeRange>('7d')
  const [data, setData] = useState<RestaurantAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = useCallback(async (selectedRange: TimeRange, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const res = await restaurantApi.getAnalytics(restaurantId, selectedRange)
      if (res.success && res.data) {
        setData(res.data)
      }
    } catch (err) {
      console.error('Failed to load restaurant analytics:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [restaurantId])

  useEffect(() => {
    fetchAnalytics(range)
  }, [fetchAnalytics, range])

  const rangeButtons: { label: string; value: TimeRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
  ]

  const summary = data?.summary

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance & Sales Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time business insights, order volume, dish popularity, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range pills */}
          <div className="inline-flex bg-muted p-1 rounded-lg">
            {rangeButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={range === btn.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setRange(btn.value)}
                className={`h-7 px-3 text-xs rounded-md ${
                  range === btn.value ? 'font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchAnalytics(range, true)}
            disabled={loading || refreshing}
            className="h-8 w-8 text-muted-foreground"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(summary?.totalRevenue || 0)}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>From paid bills</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Orders */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {summary?.totalOrders || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">{summary?.completedOrders || 0}</span> delivered
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Average Order Value (AOV) */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg. Order Value
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {formatCurrency(summary?.averageOrderValue || 0)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Per finalized bill
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Dining Tables */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Active Tables
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {summary?.activeTablesCount || 0}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Currently with open orders
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Hash className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold">Revenue & Sales Timeline</CardTitle>
              <CardDescription className="text-xs">
                Daily revenue earnings over the selected period.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Revenue (₹)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : !data?.revenueTrend || data.revenueTrend.length === 0 || summary?.totalOrders === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl">
              <TrendingUp className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No revenue recorded yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Completed and paid bills will automatically plot onto this sales timeline.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.revenueTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
                  <XAxis
                    dataKey="label"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload
                        return (
                          <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-xs space-y-1">
                            <p className="font-semibold text-foreground">{label} ({pt.date})</p>
                            <p className="text-emerald-600 font-medium">
                              Revenue: {formatCurrency(pt.revenue)}
                            </p>
                            <p className="text-muted-foreground">
                              Orders: {pt.orders}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Grid: Top Selling Items + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top Selling Dishes
            </CardTitle>
            <CardDescription className="text-xs">
              Most ordered items by total quantity sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : !data?.topSellingItems || data.topSellingItems.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No dish sales recorded yet for this timeframe.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.topSellingItems.map((item, idx) => {
                  const maxQty = data.topSellingItems[0]?.quantitySold || 1
                  const fillPercent = Math.min(100, Math.round((item.quantitySold / maxQty) * 100))

                  return (
                    <div key={item.name} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                : idx === 1
                                ? 'bg-slate-500/20 text-slate-700 dark:text-slate-300'
                                : idx === 2
                                ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-foreground">
                            {item.quantitySold} sold
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-2">
                            ({formatCurrency(item.totalRevenue)})
                          </span>
                        </div>
                      </div>

                      {/* Visual proportion bar */}
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status & Payment Breakdown */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Order Status Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Breakdown of orders processed in this timeframe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full rounded-lg" />
                  ))}
                </div>
              ) : !data?.ordersByStatus || data.ordersByStatus.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  No orders placed yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.ordersByStatus.map((st) => {
                    const isCompleted = st.status === 'Delivered'
                    const isCancelled = st.status === 'Cancelled' || st.status === 'Rejected'
                    const isProgress = !isCompleted && !isCancelled

                    return (
                      <div
                        key={st.status}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isCancelled ? (
                            <Ban className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="font-medium text-foreground">{st.status}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{st.count}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {st.percentage}%
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Split */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Payment Channels
              </CardTitle>
              <CardDescription className="text-xs">
                Collection methods for paid orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-16 w-full rounded-lg" />
              ) : !data?.paymentBreakdown || data.paymentBreakdown.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-xs">
                  No payment data available.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {data.paymentBreakdown.map((pm) => (
                    <div
                      key={pm.method}
                      className="p-3 rounded-xl bg-card border border-border text-center"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {pm.method}
                      </p>
                      <p className="text-base font-bold text-foreground mt-1">
                        {formatCurrency(pm.totalAmount)}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1.5">
                        {pm.count} bills ({pm.percentage}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
