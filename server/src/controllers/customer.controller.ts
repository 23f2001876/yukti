import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
    static async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customers = await CustomerService.getAllCustomers();
            res.status(200).json({
                success: true,
                data: customers,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getCustomerById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const customer = await CustomerService.getCustomerById(id);

            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId, isGuest } = req.body;

            const customer = await CustomerService.createCustomer({ userId, isGuest });

            res.status(201).json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getCustomerOrders(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const orders = await CustomerService.getOrdersByCustomerId(id);
            res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createGuestSession(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customer = await CustomerService.createCustomer({ isGuest: true });
            res.status(201).json({
                success: true,
                data: customer,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteCustomer(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await CustomerService.deleteCustomer(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Customer deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
