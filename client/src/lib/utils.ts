import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numeric = typeof amount === "number" ? amount : parseFloat(amount) || 0
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numeric)
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return String(dateString)
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function getStatusBadgeClass(status: string): string {
  const normalized = status?.toLowerCase()
  switch (normalized) {
    case "placed":
      return "bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "accepted":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "preparing":
      return "bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "ready":
      return "bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "delivered":
    case "completed":
    case "paid":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "cancelled":
    case "rejected":
    case "failed":
      return "bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    case "refunded":
      return "bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5 text-xs font-medium"
    default:
      return "bg-secondary text-secondary-foreground border border-border rounded-full px-2.5 py-0.5 text-xs font-medium"
  }
}

export function getCustomerDisplayName(
  customer?: { user?: { name?: string } | null; isGuest?: boolean } | null,
  tableNumber?: string | null
): string {
  if (customer?.user?.name) {
    return customer.user.name
  }
  if (tableNumber) {
    return `Table ${tableNumber}`
  }
  return "Walk-in Diner"
}

