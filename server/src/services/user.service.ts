import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";

const userRepository = AppDataSource.getRepository(User);

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return await userRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    return await userRepository.findOneBy({ id });
  }

  static async createUser(userData: { name: string; email: string }): Promise<User> {
    const existingUser = await userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const user = userRepository.create(userData);
    return await userRepository.save(user);
  }
}
