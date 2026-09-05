import { Request, Response, NextFunction } from "express";
import { BillService } from "../services/bill.service";
import { PaymentMethod, PaymentStatus } from "../entities/bill.entity";

export class BillController {
    static async getBillsByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId) as string;
            const bills = await BillService.getBillsByRestaurant(restaurantId);

            res.status(200).json({
                success: true,
                data: bills,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getBillById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.billId || req.params.id) as string;
            const bill = await BillService.getBillById(id);

            if (!bill) {
                res.status(404).json({
                    success: false,
                    message: "Bill not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOpenBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId) as string;
            const { customerId, tableNumber } = req.query;

            let bill = null;
            if (tableNumber) {
                bill = await BillService.getOpenBillForTable(restaurantId, String(tableNumber));
            } else if (customerId) {
                bill = await BillService.getOpenBillForCustomer(restaurantId, String(customerId));
            }

            if (!bill) {
                res.status(404).json({
                    success: false,
                    message: "No open bill found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.body.restaurantId) as string;
            const { customerId, tableNumber, orderIds, taxRate, paymentStatus, paymentMethod } = req.body;

            const bill = await BillService.createBill({
                restaurantId,
                customerId,
                tableNumber,
                orderIds,
                taxRate,
                paymentStatus,
                paymentMethod,
            });

            res.status(201).json({
                success: true,
                message: "Bill created successfully",
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async addOrderToBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.billId || req.params.id) as string;
            const orderId = req.params.orderId as string;
            const bill = await BillService.addOrderToBill(id, orderId);

            res.status(200).json({
                success: true,
                message: "Order added to bill successfully",
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async removeOrderFromBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.billId || req.params.id) as string;
            const orderId = req.params.orderId as string;
            const bill = await BillService.removeOrderFromBill(id, orderId);

            res.status(200).json({
                success: true,
                message: "Order removed from bill successfully",
                data: bill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateBillPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.billId || req.params.id) as string;
            const { paymentStatus, paymentMethod } = req.body;

            if (!paymentStatus) {
                res.status(400).json({
                    success: false,
                    message: "paymentStatus is required",
                });
                return;
            }

            const updatedBill = await BillService.updateBillPayment(id, {
                paymentStatus: paymentStatus as PaymentStatus,
                paymentMethod: paymentMethod as PaymentMethod,
            });

            res.status(200).json({
                success: true,
                message: "Bill payment updated successfully",
                data: updatedBill,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteBill(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.billId || req.params.id) as string;
            await BillService.deleteBill(id);

            res.status(200).json({
                success: true,
                message: "Bill deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
