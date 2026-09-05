import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
    static async getCategoriesByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId) as string;
            const categories = await CategoryService.getCategoriesByRestaurant(restaurantId);

            res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.body.restaurantId) as string;
            const { name, displayOrder } = req.body;

            if (!restaurantId || !name) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId and name are required",
                });
                return;
            }

            const category = await CategoryService.createCategory({ restaurantId, name, displayOrder });

            res.status(201).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.categoryId || req.params.id) as string;
            const { name, displayOrder } = req.body;

            const category = await CategoryService.updateCategory(id, { name, displayOrder });

            if (!category) {
                res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.categoryId || req.params.id) as string;
            const deleted = await CategoryService.deleteCategory(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
