import { Request, Response, NextFunction } from "express";
import { OrderItemService } from "../services/orderItem.service";

export class OrderItemController {
    static async getOrderItems(req: Request<{ orderId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { orderId } = req.params;
            const orderItems = await OrderItemService.getOrderItemsByOrder(orderId);

            res.status(200).json({
                success: true,
                data: orderItems,
            });
        } catch (error) {
            next(error);
        }
    }

    static async addOrderItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { orderId, menuItemId, quantity, itemNameAtOrder, priceAtOrder } = req.body;

            if (!orderId || !menuItemId || !quantity || !itemNameAtOrder || priceAtOrder === undefined) {
                res.status(400).json({
                    success: false,
                    message: "orderId, menuItemId, quantity, itemNameAtOrder, and priceAtOrder are required",
                });
                return;
            }

            const orderItem = await OrderItemService.addOrderItem({
                orderId,
                menuItemId,
                quantity,
                itemNameAtOrder,
                priceAtOrder,
            });

            res.status(201).json({
                success: true,
                data: orderItem,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateOrderItem(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            const orderItem = await OrderItemService.updateOrderItem(id, { quantity });

            if (!orderItem) {
                res.status(404).json({
                    success: false,
                    message: "Order item not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: orderItem,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteOrderItem(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await OrderItemService.deleteOrderItem(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Order item not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Order item deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
