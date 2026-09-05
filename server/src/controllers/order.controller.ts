import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { OrderItemService } from "../services/orderItem.service";
import { MenuItemService } from "../services/menuItem.service";
import { OrderStatus } from "../entities/order.entity";

export class OrderController {
    static async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.query.restaurantId) as string;

            if (!restaurantId) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId is required",
                });
                return;
            }

            const orders = await OrderService.getOrdersByRestaurant(restaurantId);

            res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.orderId || req.params.id) as string;
            const order = await OrderService.getOrderById(id);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.body.restaurantId) as string;
            const { customerId, tableNumber, status, items } = req.body;

            if (!restaurantId) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId is required",
                });
                return;
            }

            const order = await OrderService.createOrder({
                customerId,
                restaurantId,
                tableNumber,
                status,
            });

            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    if (item.menuItemId) {
                        const menuItem = await MenuItemService.getMenuItemById(item.menuItemId);
                        if (menuItem) {
                            await OrderItemService.addOrderItem({
                                orderId: order.id,
                                menuItemId: item.menuItemId,
                                quantity: item.quantity || 1,
                                itemNameAtOrder: menuItem.name,
                                priceAtOrder: menuItem.price,
                            });
                        }
                    }
                }
            }

            const fullOrder = await OrderService.getOrderById(order.id);

            res.status(201).json({
                success: true,
                data: fullOrder,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.orderId || req.params.id) as string;
            const { status } = req.body;

            if (!status) {
                res.status(400).json({
                    success: false,
                    message: "status is required",
                });
                return;
            }

            if (!Object.values(OrderStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: `status must be one of: ${Object.values(OrderStatus).join(", ")}`,
                });
                return;
            }

            const order = await OrderService.updateOrderStatus(id, status);

            if (!order) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.orderId || req.params.id) as string;
            const deleted = await OrderService.deleteOrder(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Order deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
