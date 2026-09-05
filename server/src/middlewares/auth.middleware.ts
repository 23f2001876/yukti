import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { StaffMember, StaffRole } from "../entities/staffMember.entity";
import { CustomError } from "./errorHandler";

const userRepository = AppDataSource.getRepository(User);
const staffRepository = AppDataSource.getRepository(StaffMember);

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      staff?: StaffMember;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error: CustomError = new Error("Unauthorized request");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      const error: CustomError = new Error("Invalid token");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }
    const authError: CustomError = new Error(error.message || "Invalid access token");
    authError.statusCode = 401;
    next(authError);
  }
};

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await verifyUser(req, res, () => {});

    if (!req.user || !req.user.isAdmin) {
      const error: CustomError = new Error("Access denied: Administrator privileges required");
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }
    const authError: CustomError = new Error(error.message || "Access denied");
    authError.statusCode = 403;
    next(authError);
  }
};

export const verifyStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error: CustomError = new Error("Unauthorized request");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      const error: CustomError = new Error("Invalid token");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;

    if (user.isAdmin) {
      return next();
    }

    const restaurantId = (req.params.id || req.params.restaurantId) as string;

    const staffMember = await staffRepository.findOne({
      where: {
        user: { id: user.id },
        restaurant: { id: restaurantId },
        isActive: true,
      },
      relations: { restaurant: true, user: true },
    });

    if (!staffMember) {
      const error: CustomError = new Error("Access denied: not a staff member of this restaurant");
      error.statusCode = 403;
      throw error;
    }

    req.staff = staffMember;
    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }
    const authError: CustomError = new Error(error.message || "Invalid access token");
    authError.statusCode = 401;
    next(authError);
  }
};

export const verifyOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      const error: CustomError = new Error("Unauthorized request");
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      const error: CustomError = new Error("Invalid token");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;

    if (user.isAdmin) {
      return next();
    }

    const restaurantId = (req.params.id || req.params.restaurantId) as string;

    const staffMember = await staffRepository.findOne({
      where: {
        user: { id: user.id },
        restaurant: { id: restaurantId },
        isActive: true,
        staffRole: StaffRole.Owner,
      },
      relations: { restaurant: true, user: true },
    });

    if (!staffMember) {
      const error: CustomError = new Error("Access denied: restaurant owner privileges required");
      error.statusCode = 403;
      throw error;
    }

    req.staff = staffMember;
    next();
  } catch (error: any) {
    if (error.statusCode) {
      next(error);
      return;
    }
    const authError: CustomError = new Error(error.message || "Invalid access token");
    authError.statusCode = 401;
    next(authError);
  }
};
