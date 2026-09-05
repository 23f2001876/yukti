import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OrderService } from "../services/order.service";
import { OrderItemService } from "../services/orderItem.service";
import { MenuItemService } from "../services/menuItem.service";
import { CustomerService } from "../services/customer.service";
import { RestaurantService } from "../services/restaurant.service";
import { OrderStatus } from "../entities/order.entity";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

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
            let { customerId, tableNumber, status, items } = req.body;

            if (!restaurantId) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId is required",
                });
                return;
            }

            const restaurant = await RestaurantService.getRestaurantById(restaurantId);
            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: "Restaurant not found",
                });
                return;
            }

            if (restaurant.isBanned) {
                res.status(403).json({
                    success: false,
                    message: "This restaurant is currently suspended and cannot accept orders.",
                });
                return;
            }

            let isUserAuth = false;
            if (req.cookies?.token) {
                try {
                    const decoded = jwt.verify(req.cookies.token, JWT_SECRET) as { id: string };
                    if (decoded?.id) {
                        const customer = await CustomerService.getOrCreateCustomerForUser(decoded.id);
                        if (customer) {
                            customerId = customer.id;
                            isUserAuth = true;
                        }
                    }
                } catch {
                    // Invalid/expired token - continue as anonymous guest
                }
            }

            if (!isUserAuth) {
                const guestCustomer = await CustomerService.getOrCreateGuestCustomer(customerId);
                customerId = guestCustomer.id;
            }

            const order = await OrderService.createOrder({
                customerId,
                restaurantId,
                tableNumber,
                status,
                items,
            });

            res.status(201).json({
                success: true,
                data: order,
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
