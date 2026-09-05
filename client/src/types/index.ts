export interface StaffMembershipInfo {
  id: string
  restaurantId: string
  restaurantName: string
  staffRole: StaffRole
  isActive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  isAdmin: boolean
  staffMemberships?: StaffMembershipInfo[]
  createdAt: string
  updatedAt: string
}

export interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  phone: string
  email?: string
  openingHours?: string
  logoUrl?: string
  isBanned: boolean
  owner?: StaffMember | null
  createdAt: string
  updatedAt: string
  menuItems?: MenuItem[]
  categories?: Category[]
  staff?: StaffMember[]
  orders?: Order[]
  bills?: Bill[]
}

export interface Category {
  id: string
  name: string
  displayOrder: number
  restaurantId?: string
  restaurant?: Restaurant
  menuItems?: MenuItem[]
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  sortOrder: number
  restaurant?: Restaurant
  category?: Category
  categoryId?: string
  createdAt: string
  updatedAt: string
}

export type StaffRole = 'Owner' | 'Chef' | 'Waiter' | 'Manager'

export interface StaffMember {
  id: string
  staffRole: StaffRole
  isActive: boolean
  user: User
  restaurant?: Restaurant
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  isGuest: boolean
  user?: User | null
  createdAt: string
  updatedAt: string
  orders?: Order[]
}

export type OrderStatus =
  | 'Placed'
  | 'Accepted'
  | 'Rejected'
  | 'Preparing'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled'

export interface OrderItem {
  id: string
  quantity: number
  itemNameAtOrder?: string
  priceAtOrder?: number
  menuItem: MenuItem
  order?: Order
}

export interface Order {
  id: string
  status: OrderStatus
  customerId?: string | null
  customer?: Customer | null
  restaurant?: Restaurant
  billId?: string | null
  bill?: Bill | null
  tableNumber?: string | null
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed'
export type PaymentMethod = 'Cash' | 'Card' | 'UPI'

export interface Bill {
  id: string
  subtotal: number
  tax: number
  total: number
  tableNumber?: string | null
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod | null
  paidAt: string | null
  orders?: Order[]
  restaurant?: Restaurant
  customer?: Customer | null
  createdAt: string
  updatedAt: string
}

// ─── API payload interfaces ───────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  password?: string
}

export interface CreateCategoryData {
  name: string
  displayOrder?: number
}

export interface UpdateCategoryData {
  name?: string
  displayOrder?: number
}

export interface CreateMenuItemData {
  categoryId: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  isAvailable?: boolean
  sortOrder?: number
}

export interface UpdateMenuItemData {
  name?: string
  price?: number
  description?: string
  imageUrl?: string
  isAvailable?: boolean
  sortOrder?: number
  categoryId?: string
}

export interface CreateOrderItemPayload {
  menuItemId: string
  quantity: number
}

export interface CreateOrderPayload {
  customerId?: string
  tableNumber?: string
  status?: OrderStatus
  items: CreateOrderItemPayload[]
}

export interface CreateStaffData {
  email?: string
  userId?: string
  staffRole: StaffRole
}

export interface UpdateStaffData {
  staffRole?: StaffRole
  isActive?: boolean
}

export interface CreateBillData {
  customerId?: string
  tableNumber?: string
  orderIds?: string[]
  taxRate?: number
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
}

export interface UpdateBillPaymentData {
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
}

// ─── API response wrappers ───────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// ─── Analytics Types ─────────────────────────
export interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  completedOrders: number
  averageOrderValue: number
  activeTablesCount: number
  totalCustomers: number
}

export interface RevenueTrendPoint {
  date: string
  label: string
  revenue: number
  orders: number
}

export interface TopSellingItem {
  name: string
  quantitySold: number
  totalRevenue: number
}

export interface StatusBreakdown {
  status: string
  count: number
  percentage: number
}

export interface PaymentBreakdown {
  method: string
  count: number
  totalAmount: number
  percentage: number
}

export interface RestaurantAnalytics {
  timeRange: 'today' | '7d' | '30d' | 'all'
  summary: AnalyticsSummary
  revenueTrend: RevenueTrendPoint[]
  topSellingItems: TopSellingItem[]
  ordersByStatus: StatusBreakdown[]
  paymentBreakdown: PaymentBreakdown[]
}
