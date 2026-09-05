import { AppDataSource } from "../data-source";
import { StaffMember, StaffRole } from "../entities/staffMember.entity";
import { User } from "../entities/user.entity";

const staffRepository = AppDataSource.getRepository(StaffMember);
const userRepository = AppDataSource.getRepository(User);

export class StaffMemberService {
    static async getStaffByRestaurant(restaurantId: string): Promise<StaffMember[]> {
        return await staffRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: { user: true },
            order: { createdAt: "DESC" },
        });
    }

    static async getStaffById(id: string): Promise<StaffMember | null> {
        return await staffRepository.findOne({
            where: { id },
            relations: { restaurant: true, user: true },
        });
    }

    static async addStaffMember(data: {
        restaurantId: string;
        userId?: string;
        email?: string;
        staffRole: StaffRole;
    }): Promise<StaffMember> {
        let user: User | null = null;

        if (data.email) {
            user = await userRepository.findOneBy({ email: data.email.trim().toLowerCase() });
            if (!user) {
                throw new Error(`No registered user found with email "${data.email.trim()}". Please ask them to sign up first.`);
            }
        } else if (data.userId) {
            user = await userRepository.findOneBy({ id: data.userId });
            if (!user) {
                throw new Error("User not found with the provided ID.");
            }
        } else {
            throw new Error("Staff member's email or userId is required.");
        }

        const existingStaff = await staffRepository.findOne({
            where: {
                user: { id: user.id },
                restaurant: { id: data.restaurantId },
            },
            relations: { user: true },
        });

        if (existingStaff) {
            if (!existingStaff.isActive) {
                existingStaff.isActive = true;
                existingStaff.staffRole = data.staffRole;
                existingStaff.updatedAt = new Date();
                return await staffRepository.save(existingStaff);
            }
            throw new Error(`User "${user.email}" is already assigned as a staff member (${existingStaff.staffRole}) at this restaurant.`);
        }

        const staffMember = staffRepository.create({
            restaurant: { id: data.restaurantId },
            user,
            staffRole: data.staffRole,
            isActive: true,
        });

        return await staffRepository.save(staffMember);
    }

    static async updateStaffMember(
        id: string,
        data: Partial<{
            staffRole: StaffRole;
            isActive: boolean;
        }>
    ): Promise<StaffMember | null> {
        const staffMember = await staffRepository.findOneBy({ id });
        if (!staffMember) {
            return null;
        }

        Object.assign(staffMember, data, { updatedAt: new Date() });
        return await staffRepository.save(staffMember);
    }

    static async removeStaffMember(id: string): Promise<boolean> {
        const staffMember = await staffRepository.findOneBy({ id });
        if (!staffMember) {
            return false;
        }

        await staffRepository.remove(staffMember);
        return true;
    }
}
