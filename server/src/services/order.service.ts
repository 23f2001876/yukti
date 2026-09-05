import { AppDataSource } from "../data-source";
import { Orders, OrderStatus } from "../entities/order.entity";
import { BillService } from "./bill.service";

const orderRepository = AppDataSource.getRepository(Orders);

export class OrderService {
    static async getOrdersByRestaurant(restaurantId: string): Promise<Orders[]> {
        return await orderRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: {
                customer: true,
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
                customer: true,
                restaurant: true,
                bill: true,
                orderItems: { menuItem: true },
            },
        });
    }

    static async createOrder(data: {
        customerId: string;
        restaurantId: string;
        billId?: string;
        tableNumber?: string;
        status?: OrderStatus;
    }): Promise<Orders> {
        const { customerId, restaurantId, billId, tableNumber, ...rest } = data;

        // If no explicit billId is provided, check if there is an active pending bill for this table or customer
        let activeBillId = billId;
        if (!activeBillId && tableNumber) {
            const tableBill = await BillService.getOpenBillForTable(restaurantId, tableNumber);
            if (tableBill) activeBillId = tableBill.id;
        }
        if (!activeBillId && customerId) {
            const custBill = await BillService.getOpenBillForCustomer(restaurantId, customerId);
            if (custBill) activeBillId = custBill.id;
        }

        const order = orderRepository.create({
            ...rest,
            customer: { id: customerId },
            restaurant: { id: restaurantId },
            tableNumber: tableNumber || null,
            bill: activeBillId ? { id: activeBillId } : null,
        });

        const savedOrder = await orderRepository.save(order);

        // If attached to a bill, recalculate bill total
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
