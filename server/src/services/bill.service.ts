import { AppDataSource } from "../data-source";
import { Bill, PaymentMethod, PaymentStatus } from "../entities/bill.entity";
import { Orders } from "../entities/order.entity";
import { In } from "typeorm";

const billRepository = AppDataSource.getRepository(Bill);
const orderRepository = AppDataSource.getRepository(Orders);

export class BillService {
    static async getBillsByRestaurant(restaurantId: string): Promise<Bill[]> {
        return await billRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: {
                orders: { orderItems: { menuItem: true } },
                customer: { user: true },
            },
            order: { createdAt: "DESC" },
        });
    }

    static async getBillById(id: string): Promise<Bill | null> {
        return await billRepository.findOne({
            where: { id },
            relations: {
                orders: { orderItems: { menuItem: true } },
                restaurant: true,
                customer: { user: true },
            },
        });
    }

    static async getOpenBillForCustomer(restaurantId: string, customerId: string): Promise<Bill | null> {
        return await billRepository.findOne({
            where: {
                restaurant: { id: restaurantId },
                customer: { id: customerId },
                paymentStatus: PaymentStatus.Pending,
            },
            relations: {
                orders: { orderItems: { menuItem: true } },
            },
            order: { createdAt: "DESC" },
        });
    }

    static async getOpenBillForTable(restaurantId: string, tableNumber: string): Promise<Bill | null> {
        return await billRepository.findOne({
            where: {
                restaurant: { id: restaurantId },
                tableNumber,
                paymentStatus: PaymentStatus.Pending,
            },
            relations: {
                orders: { orderItems: { menuItem: true } },
            },
            order: { createdAt: "DESC" },
        });
    }

    static async createBill(data: {
        restaurantId: string;
        customerId?: string;
        tableNumber?: string;
        orderIds?: string[];
        taxRate?: number;
        paymentStatus?: PaymentStatus;
        paymentMethod?: PaymentMethod;
    }): Promise<Bill> {
        const { restaurantId, customerId, tableNumber, orderIds = [], taxRate = 0, paymentStatus = PaymentStatus.Pending, paymentMethod } = data;

        const bill = billRepository.create({
            restaurant: { id: restaurantId },
            customer: customerId ? { id: customerId } : null,
            tableNumber: tableNumber || null,
            paymentStatus,
            paymentMethod: paymentMethod || null,
            subtotal: 0,
            tax: 0,
            total: 0,
        });

        const savedBill = await billRepository.save(bill);

        if (orderIds.length > 0) {
            // Attach orders to this bill
            await orderRepository.update({ id: In(orderIds) }, { bill: savedBill });
            await this.recalculateBillTotal(savedBill.id, taxRate);
        }

        return (await this.getBillById(savedBill.id))!;
    }

    static async addOrderToBill(billId: string, orderId: string, taxRate = 0): Promise<Bill> {
        const bill = await billRepository.findOneBy({ id: billId });
        if (!bill) {
            throw new Error("Bill not found.");
        }

        await orderRepository.update({ id: orderId }, { bill: { id: billId } });
        await this.recalculateBillTotal(billId, taxRate);

        return (await this.getBillById(billId))!;
    }

    static async removeOrderFromBill(billId: string, orderId: string, taxRate = 0): Promise<Bill> {
        const bill = await billRepository.findOneBy({ id: billId });
        if (!bill) {
            throw new Error("Bill not found.");
        }

        await orderRepository.update({ id: orderId, bill: { id: billId } }, { bill: null });
        await this.recalculateBillTotal(billId, taxRate);

        return (await this.getBillById(billId))!;
    }

    static async recalculateBillTotal(billId: string, taxRate = 0): Promise<Bill> {
        const bill = await billRepository.findOne({
            where: { id: billId },
            relations: {
                orders: { orderItems: { menuItem: true } },
            },
        });

        if (!bill) {
            throw new Error("Bill not found.");
        }

        let subtotal = 0;
        if (bill.orders && bill.orders.length > 0) {
            for (const order of bill.orders) {
                if (order.orderItems && order.orderItems.length > 0) {
                    for (const item of order.orderItems) {
                        const price = Number(item.menuItem?.price || 0);
                        const qty = Number(item.quantity || 1);
                        subtotal += price * qty;
                    }
                }
            }
        }

        const tax = Number((subtotal * taxRate).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));

        bill.subtotal = subtotal;
        bill.tax = tax;
        bill.total = total;
        bill.updatedAt = new Date();

        return await billRepository.save(bill);
    }

    static async updateBillPayment(
        id: string,
        data: {
            paymentStatus: PaymentStatus;
            paymentMethod?: PaymentMethod;
        }
    ): Promise<Bill | null> {
        const bill = await billRepository.findOneBy({ id });
        if (!bill) {
            throw new Error("Bill not found.");
        }

        bill.paymentStatus = data.paymentStatus;
        if (data.paymentMethod) {
            bill.paymentMethod = data.paymentMethod;
        }
        if (data.paymentStatus === PaymentStatus.Paid) {
            bill.paidAt = new Date();
        }
        bill.updatedAt = new Date();

        return await billRepository.save(bill);
    }

    static async deleteBill(id: string): Promise<boolean> {
        const bill = await billRepository.findOneBy({ id });
        if (!bill) {
            throw new Error("Bill not found.");
        }

        // Dissociate orders first
        await orderRepository.update({ bill: { id } }, { bill: null });
        await billRepository.remove(bill);
        return true;
    }
}
