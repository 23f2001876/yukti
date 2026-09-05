import { Request, Response, NextFunction } from "express";
import { StaffMemberService } from "../services/staffMember.service";
import { StaffRole } from "../entities/staffMember.entity";

export class StaffMemberController {
    static async getStaffByRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId) as string;
            const staff = await StaffMemberService.getStaffByRestaurant(restaurantId);

            res.status(200).json({
                success: true,
                data: staff,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getStaffById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.staffId || req.params.id) as string;
            const staffMember = await StaffMemberService.getStaffById(id);

            if (!staffMember) {
                res.status(404).json({
                    success: false,
                    message: "Staff member not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: staffMember,
            });
        } catch (error) {
            next(error);
        }
    }

    static async addStaffMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.params.id || req.params.restaurantId || req.body.restaurantId) as string;
            const { userId, email, staffRole } = req.body;

            if (!restaurantId || (!userId && !email) || !staffRole) {
                res.status(400).json({
                    success: false,
                    message: "restaurantId, staff member email (or userId), and staffRole are required",
                });
                return;
            }

            if (!Object.values(StaffRole).includes(staffRole)) {
                res.status(400).json({
                    success: false,
                    message: `staffRole must be one of: ${Object.values(StaffRole).join(", ")}`,
                });
                return;
            }

            const staffMember = await StaffMemberService.addStaffMember({
                restaurantId,
                userId,
                email,
                staffRole,
            });

            res.status(201).json({
                success: true,
                message: "Staff member assigned successfully",
                data: staffMember,
            });
        } catch (error: any) {
            const msg = (error.message || "").toLowerCase();
            if (
                msg.includes("found") ||
                msg.includes("already assigned") ||
                msg.includes("required")
            ) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }

    static async updateStaffMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.staffId || req.params.id) as string;
            const { staffRole, isActive } = req.body;

            if (staffRole && !Object.values(StaffRole).includes(staffRole)) {
                res.status(400).json({
                    success: false,
                    message: `staffRole must be one of: ${Object.values(StaffRole).join(", ")}`,
                });
                return;
            }

            const staffMember = await StaffMemberService.updateStaffMember(id, { staffRole, isActive });

            if (!staffMember) {
                res.status(404).json({
                    success: false,
                    message: "Staff member not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: staffMember,
            });
        } catch (error) {
            next(error);
        }
    }

    static async removeStaffMember(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = (req.params.staffId || req.params.id) as string;
            const removed = await StaffMemberService.removeStaffMember(id);

            if (!removed) {
                res.status(404).json({
                    success: false,
                    message: "Staff member not found",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Staff member removed successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}
