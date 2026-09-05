import { Request, Response, NextFunction } from "express";
import { MenuItemService } from "../services/menuItem.service";

export class MenuItemController {
    static async getMenuItems(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.query.restaurantId) as string;

            if (!restaurantId) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId is required",
                });
                return;
            }

            const menuItems = await MenuItemService.getMenuItemsByRestaurant(restaurantId);

            res.status(200).json({
                success: true,
                data: menuItems,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.body.restaurantId) as string;
            const { categoryId, name, price, description, imageUrl, isAvailable, sortOrder } = req.body;

            if (!restaurantId || !categoryId || !name || price === undefined) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId, categoryId, name, and price are required",
                });
                return;
            }

            const menuItem = await MenuItemService.createMenuItem({
                restaurantId,
                categoryId,
                name,
                price,
                description,
                imageUrl,
                isAvailable,
                sortOrder,
            });

            res.status(201).json({
                success: true,
                data: menuItem,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.menuItemId || req.params.id) as string;
            const { name, price, description, imageUrl, isAvailable, sortOrder, categoryId } = req.body;

            const menuItem = await MenuItemService.updateMenuItem(id, {
                name,
                price,
                description,
                imageUrl,
                isAvailable,
                sortOrder,
                categoryId,
            });

            if (!menuItem) {
                res.status(404).json({
                    success: false,
                    message: "Menu item not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: menuItem,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.menuItemId || req.params.id) as string;
            const deleted = await MenuItemService.deleteMenuItem(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Menu item not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Menu item deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
