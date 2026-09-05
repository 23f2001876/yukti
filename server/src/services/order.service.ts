import { AppDataSource } from "../data-source";
import { Orders, OrderStatus } from "../entities/order.entity";
import { BillService } from "./bill.service";
import { MenuItemService } from "./menuItem.service";
import { OrderItemService } from "./orderItem.service";

const orderRepository = AppDataSource.getRepository(Orders);

export class OrderService {
    static async getOrdersByRestaurant(restaurantId: string): Promise<Orders[]> {
        return await orderRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: {
                customer: { user: true },
                bill: true,
                orderItems: { menuItem: true },
            },
            order: { createdAt: "DESC" },
        });
    }

    static async getOrderById(id: string): Promise<Orders | null> {
        return await orderRepository.findOne({
            where: { id },
            relations: {
                customer: { user: true },
                restaurant: true,
                bill: true,
                orderItems: { menuItem: true },
            },
        });
    }

    static async createOrder(data: {
        customerId?: string | null;
        restaurantId: string;
        billId?: string | null;
        tableNumber?: string | null;
        status?: OrderStatus;
        items?: { menuItemId: string; quantity: number }[];
    }): Promise<Orders> {
        const { customerId, restaurantId, billId, tableNumber, items, ...rest } = data;

        let activeBillId = billId;
        if (!activeBillId && tableNumber) {
            const tableBill = await BillService.getOpenBillForTable(restaurantId, tableNumber);
            if (tableBill) {
                activeBillId = tableBill.id;
            } else {
                try {
                    const newBill = await BillService.createBill({
                        restaurantId,
                        tableNumber,
                        customerId: customerId || undefined,
                    });
                    if (newBill) activeBillId = newBill.id;
                } catch {
                    // Fall back to unbilled order if bill creation encounters an edge case
                }
            }
        }
        if (!activeBillId && customerId) {
            const custBill = await BillService.getOpenBillForCustomer(restaurantId, customerId);
            if (custBill) activeBillId = custBill.id;
        }

        const order = orderRepository.create({
            ...rest,
            customerId: customerId || null,
            customer: customerId ? { id: customerId } : null,
            restaurant: { id: restaurantId },
            tableNumber: tableNumber || null,
            billId: activeBillId || null,
            bill: activeBillId ? { id: activeBillId } : null,
        });

        const savedOrder = await orderRepository.save(order);

        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (item.menuItemId) {
                    const menuItem = await MenuItemService.getMenuItemById(item.menuItemId);
                    if (menuItem) {
                        await OrderItemService.addOrderItem({
                            orderId: savedOrder.id,
                            menuItemId: item.menuItemId,
                            quantity: item.quantity || 1,
                            itemNameAtOrder: menuItem.name,
                            priceAtOrder: menuItem.price,
                        });
                    }
                }
            }
        }

        if (activeBillId) {
            await BillService.recalculateBillTotal(activeBillId);
        }

        return (await this.getOrderById(savedOrder.id))!;
    }

    static async updateOrderStatus(id: string, status: OrderStatus): Promise<Orders | null> {
        const order = await orderRepository.findOneBy({ id });
        if (!order) {
            return null;
        }

        order.status = status;
        order.updatedAt = new Date();
        return await orderRepository.save(order);
    }

    static async assignOrderToBill(orderId: string, billId: string): Promise<Orders | null> {
        const order = await orderRepository.findOneBy({ id: orderId });
        if (!order) return null;

        order.bill = { id: billId } as any;
        order.updatedAt = new Date();
        const saved = await orderRepository.save(order);

        await BillService.recalculateBillTotal(billId);
        return saved;
    }

    static async deleteOrder(id: string): Promise<boolean> {
        const order = await orderRepository.findOne({ where: { id }, relations: { bill: true } });
        if (!order) {
            return false;
        }

        const linkedBillId = order.bill?.id;
        await orderRepository.remove(order);

        if (linkedBillId) {
            await BillService.recalculateBillTotal(linkedBillId);
        }

        return true;
    }
}
