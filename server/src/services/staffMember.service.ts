import { AppDataSource } from "../data-source";
import { StaffMember, StaffRole } from "../entities/staffMember.entity";

const staffRepository = AppDataSource.getRepository(StaffMember);

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
        userId: string;
        staffRole: StaffRole;
    }): Promise<StaffMember> {
        const { restaurantId, userId, ...rest } = data;

        const staffMember = staffRepository.create({
            ...rest,
            restaurant: { id: restaurantId },
            user: { id: userId },
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
