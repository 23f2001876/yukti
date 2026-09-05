import { Request, Response, NextFunction } from "express";
import { RestaurantService } from "../services/restaurant.service";

export class RestaurantController {
    static async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurants = await RestaurantService.getAllRestaurants();
            res.status(200).json({
                success: true,
                data: restaurants,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getRestaurantById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const restaurant = await RestaurantService.getRestaurantById(id);

            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: "Restaurant not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: restaurant,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, address, phone, description, email, openingHours, logoUrl } = req.body;

            if (!name || !address || !phone) {
                res.status(400).json({
                    success: false,
                    message: "missing required fields.",
                });
                return;
            }

            const restaurant = await RestaurantService.createRestaurant({
                name,
                address,
                phone,
                description,
                email,
                openingHours,
                logoUrl,
            }, req.user);

            res.status(201).json({
                success: true,
                data: restaurant,
            });
        } catch (error: any) {
            if (error.message && error.message.includes("already exists")) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    static async updateRestaurant(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, address, phone, description, email, openingHours, logoUrl } = req.body;

            const restaurant = await RestaurantService.updateRestaurant(id, {
                name,
                address,
                phone,
                description,
                email,
                openingHours,
                logoUrl,
            });

            if (!restaurant) {
                res.status(404).json({
                    success: false,
                    message: "Restaurant not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: restaurant,
            });
        } catch (error) {
            next(error);
        }
    }

    static async toggleBan(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { isBanned } = req.body;

            const existing = await RestaurantService.getRestaurantById(id);
            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: "Restaurant not found",
                });
                return;
            }

            const targetBanStatus = typeof isBanned === "boolean" ? isBanned : !existing.isBanned;
            const updated = await RestaurantService.setBanStatus(id, targetBanStatus);

            res.status(200).json({
                success: true,
                message: targetBanStatus ? "Restaurant banned successfully" : "Restaurant unbanned successfully",
                data: updated,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteRestaurant(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await RestaurantService.deleteRestaurant(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Restaurant not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Restaurant deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}