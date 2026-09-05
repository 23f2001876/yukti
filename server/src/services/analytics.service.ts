import { AppDataSource } from "../data-source";
import { Bill, PaymentMethod, PaymentStatus } from "../entities/bill.entity";
import { Orders, OrderStatus } from "../entities/order.entity";
import { OrderItem } from "../entities/orderItem.entity";
import { MoreThanOrEqual } from "typeorm";

const billRepository = AppDataSource.getRepository(Bill);
const orderRepository = AppDataSource.getRepository(Orders);
const orderItemRepository = AppDataSource.getRepository(OrderItem);

export type AnalyticsRange = "today" | "7d" | "30d" | "all";

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  activeTablesCount: number;
  totalCustomers: number;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  name: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface RestaurantAnalyticsData {
  timeRange: AnalyticsRange;
  summary: AnalyticsSummary;
  revenueTrend: RevenueTrendPoint[];
  topSellingItems: TopSellingItem[];
  ordersByStatus: StatusBreakdown[];
  paymentBreakdown: PaymentBreakdown[];
}

function getStartDate(range: AnalyticsRange): Date | null {
  const now = new Date();
  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  return null;
}

function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toShortDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export class AnalyticsService {
  static async getRestaurantAnalytics(
    restaurantId: string,
    range: AnalyticsRange = "7d"
  ): Promise<RestaurantAnalyticsData> {
    const startDate = getStartDate(range);

    const billWhere: any = { restaurant: { id: restaurantId } };
    if (startDate) {
      billWhere.createdAt = MoreThanOrEqual(startDate);
    }
    const bills = await billRepository.find({
      where: billWhere,
      order: { createdAt: "ASC" },
    });

    const orderWhere: any = { restaurant: { id: restaurantId } };
    if (startDate) {
      orderWhere.createdAt = MoreThanOrEqual(startDate);
    }
    const orders = await orderRepository.find({
      where: orderWhere,
      relations: { orderItems: true },
      order: { createdAt: "ASC" },
    });

    const paidBills = bills.filter((b) => b.paymentStatus === PaymentStatus.Paid);
    const totalRevenueRaw = paidBills.reduce((sum, b) => sum + Number(b.total || 0), 0);
    const totalRevenue = Math.round(totalRevenueRaw * 100) / 100;

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === OrderStatus.Delivered).length;

    const averageOrderValue =
      paidBills.length > 0 ? Math.round((totalRevenue / paidBills.length) * 100) / 100 : 0;

    const activeTablesSet = new Set<string>();
    orders.forEach((o) => {
      if (
        o.tableNumber &&
        o.status !== OrderStatus.Delivered &&
        o.status !== OrderStatus.Cancelled &&
        o.status !== OrderStatus.Rejected
      ) {
        activeTablesSet.add(o.tableNumber.trim());
      }
    });
    const activeTablesCount = activeTablesSet.size;

    const customerIdsSet = new Set<string>();
    orders.forEach((o) => {
      if (o.customerId) customerIdsSet.add(o.customerId);
    });
    const totalCustomers = customerIdsSet.size;

    const revenueTrend = this.buildRevenueTrend(range, startDate, paidBills, orders);

    const itemMap = new Map<string, { name: string; quantitySold: number; totalRevenue: number }>();
    orders.forEach((order) => {
      if (order.status === OrderStatus.Cancelled || order.status === OrderStatus.Rejected) {
        return;
      }
      order.orderItems?.forEach((item) => {
        const name = item.itemNameAtOrder || "Unknown Item";
        const qty = Number(item.quantity || 1);
        const price = Number(item.priceAtOrder || 0);
        const revenue = qty * price;

        const current = itemMap.get(name) || { name, quantitySold: 0, totalRevenue: 0 };
        current.quantitySold += qty;
        current.totalRevenue += revenue;
        itemMap.set(name, current);
      });
    });

    const topSellingItems: TopSellingItem[] = Array.from(itemMap.values())
      .map((item) => ({
        ...item,
        totalRevenue: Math.round(item.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 6);

    const statusCounts: Record<string, number> = {};
    Object.values(OrderStatus).forEach((st) => {
      statusCounts[st] = 0;
    });
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const ordersByStatus: StatusBreakdown[] = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
      }))
      .filter((s) => s.count > 0 || totalOrders === 0);

    const paymentMap: Record<string, { count: number; total: number }> = {
      [PaymentMethod.Cash]: { count: 0, total: 0 },
      [PaymentMethod.UPI]: { count: 0, total: 0 },
      [PaymentMethod.Card]: { count: 0, total: 0 },
    };

    paidBills.forEach((bill) => {
      const method = bill.paymentMethod || PaymentMethod.Cash;
      if (!paymentMap[method]) {
        paymentMap[method] = { count: 0, total: 0 };
      }
      paymentMap[method].count += 1;
      paymentMap[method].total += Number(bill.total || 0);
    });

    const paymentBreakdown: PaymentBreakdown[] = Object.entries(paymentMap).map(
      ([method, data]) => ({
        method,
        count: data.count,
        totalAmount: Math.round(data.total * 100) / 100,
        percentage:
          paidBills.length > 0 ? Math.round((data.count / paidBills.length) * 100) : 0,
      })
    );

    return {
      timeRange: range,
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        averageOrderValue,
        activeTablesCount,
        totalCustomers,
      },
      revenueTrend,
      topSellingItems,
      ordersByStatus,
      paymentBreakdown,
    };
  }

  private static buildRevenueTrend(
    range: AnalyticsRange,
    startDate: Date | null,
    paidBills: Bill[],
    orders: Orders[]
  ): RevenueTrendPoint[] {
    const days = range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 14;
    const now = new Date();
    const trendMap = new Map<string, { label: string; revenue: number; orders: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = toIsoDateString(d);
      const label = range === "today" ? "Today" : toShortDateLabel(d);
      trendMap.set(iso, { label, revenue: 0, orders: 0 });
    }

    paidBills.forEach((bill) => {
      const billDate = new Date(bill.createdAt);
      const iso = toIsoDateString(billDate);
      const entry = trendMap.get(iso);
      if (entry) {
        entry.revenue += Number(bill.total || 0);
      } else if (range === "all") {
        trendMap.set(iso, {
          label: toShortDateLabel(billDate),
          revenue: Number(bill.total || 0),
          orders: 0,
        });
      }
    });

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const iso = toIsoDateString(orderDate);
      const entry = trendMap.get(iso);
      if (entry) {
        entry.orders += 1;
      } else if (range === "all") {
        const cur = trendMap.get(iso) || {
          label: toShortDateLabel(orderDate),
          revenue: 0,
          orders: 0,
        };
        cur.orders += 1;
        trendMap.set(iso, cur);
      }
    });

    return Array.from(trendMap.entries()).map(([date, val]) => ({
      date,
      label: val.label,
      revenue: Math.round(val.revenue * 100) / 100,
      orders: val.orders,
    }));
  }
}
