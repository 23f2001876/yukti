import { AppDataSource } from "../data-source";
import { OrderItem } from "../entities/orderItem.entity";

const orderItemRepository = AppDataSource.getRepository(OrderItem);

export class OrderItemService {
    static async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
        return await orderItemRepository.find({
            where: { order: { id: orderId } },
            relations: { menuItem: true },
        });
    }

    static async addOrderItem(data: {
        orderId: string;
        menuItemId: string;
        quantity: number;
        itemNameAtOrder: string;
        priceAtOrder: number;
    }): Promise<OrderItem> {
        const { orderId, menuItemId, ...rest } = data;

        const orderItem = orderItemRepository.create({
            ...rest,
            order: { id: orderId },
            menuItem: { id: menuItemId },
        });

        return await orderItemRepository.save(orderItem);
    }

    static async updateOrderItem(
        id: string,
        data: Partial<{ quantity: number }>
    ): Promise<OrderItem | null> {
        const orderItem = await orderItemRepository.findOneBy({ id });
        if (!orderItem) {
            return null;
        }

        Object.assign(orderItem, data);
        return await orderItemRepository.save(orderItem);
    }

    static async deleteOrderItem(id: string): Promise<boolean> {
        const orderItem = await orderItemRepository.findOneBy({ id });
        if (!orderItem) {
            return false;
        }

        await orderItemRepository.remove(orderItem);
        return true;
    }
}
