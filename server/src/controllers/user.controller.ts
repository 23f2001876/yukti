import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
        return;
      }

      const { user, token } = await UserService.register({ name, email, password, phone });

      res.cookie("token", token, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: user,
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

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const { user, token } = await UserService.login({ email, password });

      res.cookie("token", token, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      if (error.message && error.message.includes("Invalid email or password")) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("token", COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await UserService.getUserById(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const { name, phone, password } = req.body;
      const updatedUser = await UserService.updateUser(req.user.id, { name, phone, password });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
