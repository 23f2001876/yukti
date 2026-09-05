import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

import { StaffMember, StaffRole } from "../entities/staffMember.entity";

const userRepository = AppDataSource.getRepository(User);
const staffRepository = AppDataSource.getRepository(StaffMember);
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key";

export interface StaffMembershipInfo {
  id: string;
  restaurantId: string;
  restaurantName: string;
  staffRole: StaffRole;
  isActive: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  staffMemberships?: StaffMembershipInfo[];
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeUser = (user: User): UserResponse => {
  const { passwordHash: _, ...sanitized } = user;
  return sanitized;
};

const getStaffMembershipsForUser = async (userId: string): Promise<StaffMembershipInfo[]> => {
  const staff = await staffRepository.find({
    where: { user: { id: userId }, isActive: true },
    relations: { restaurant: true },
  });

  return staff.map((s) => ({
    id: s.id,
    restaurantId: s.restaurant?.id,
    restaurantName: s.restaurant?.name,
    staffRole: s.staffRole,
    isActive: s.isActive,
  }));
};

export class UserService {
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await userRepository.find({
      order: { createdAt: "DESC" },
    });
    return users.map(sanitizeUser);
  }

  static async getUserById(id: string): Promise<UserResponse | null> {
    const user = await userRepository.findOneBy({ id });
    if (!user) return null;
    const sanitized = sanitizeUser(user);
    sanitized.staffMemberships = await getStaffMembershipsForUser(user.id);
    return sanitized;
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: UserResponse; token: string }> {
    const existingUser = await userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = userRepository.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash,
    });

    const savedUser = await userRepository.save(user);

    const token = jwt.sign({ id: savedUser.id }, JWT_SECRET, { expiresIn: "7d" });
    const sanitized = sanitizeUser(savedUser);
    sanitized.staffMemberships = [];

    return {
      user: sanitized,
      token,
    };
  }

  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: UserResponse; token: string }> {
    const user = await userRepository.findOneBy({ email: credentials.email });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password.");
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const sanitized = sanitizeUser(user);
    sanitized.staffMemberships = await getStaffMembershipsForUser(user.id);

    return {
      user: sanitized,
      token,
    };
  }

  static async updateUser(
    id: string,
    data: { name?: string; phone?: string; password?: string }
  ): Promise<UserResponse | null> {
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new Error("User not found.");
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }
    user.updatedAt = new Date();

    const updatedUser = await userRepository.save(user);
    return sanitizeUser(updatedUser);
  }
}
