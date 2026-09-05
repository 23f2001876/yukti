import { AppDataSource } from "../data-source";
import { Restaurant } from "../entities/restaurant.entity";
import { StaffMember, StaffRole } from "../entities/staffMember.entity";
import { User } from "../entities/user.entity";

const restaurantRepository = AppDataSource.getRepository(Restaurant);
const staffRepository = AppDataSource.getRepository(StaffMember);

export class RestaurantService {
    static async getAllRestaurants(): Promise<Restaurant[]> {
        return await restaurantRepository.find();
    }

    static async getRestaurantById(id: string): Promise<Restaurant | null> {
        return await restaurantRepository.findOne({
            where: { id },
            relations: { menuItems: true },
        });
    }

    static async createRestaurant(
        data: {
            name: string;
            address: string;
            phone: string;
            description?: string;
            email?: string;
            openingHours?: string;
            logoUrl?: string;
        },
        creator?: User
    ): Promise<Restaurant> {
        const existingRestaurant = await restaurantRepository.findOneBy({ name: data.name });
        if (existingRestaurant) {
            throw new Error("A restaurant with this name already exists.");
        }

        let restaurant = restaurantRepository.create(data);
        restaurant = await restaurantRepository.save(restaurant);

        if (creator) {
            const ownerStaff = staffRepository.create({
                user: creator,
                restaurant,
                staffRole: StaffRole.Owner,
                isActive: true,
            });
            const savedOwnerStaff = await staffRepository.save(ownerStaff);
            restaurant.owner = savedOwnerStaff;
            await restaurantRepository.save(restaurant);
        }

        return restaurant;
    }

    static async updateRestaurant(
        id: string,
        data: Partial<{
            name: string;
            address: string;
            phone: string;
            description: string;
            email: string;
            openingHours: string;
            logoUrl: string;
        }>
    ): Promise<Restaurant | null> {
        const restaurant = await restaurantRepository.findOneBy({ id });
        if (!restaurant) {
            throw new Error("The restaurant does not exists.");
        }

        Object.assign(restaurant, data, { updatedAt: new Date() });
        return await restaurantRepository.save(restaurant);
    }

    static async setBanStatus(id: string, isBanned: boolean): Promise<Restaurant | null> {
        const restaurant = await restaurantRepository.findOneBy({ id });
        if (!restaurant) {
            return null;
        }

        restaurant.isBanned = isBanned;
        restaurant.updatedAt = new Date();
        return await restaurantRepository.save(restaurant);
    }

    static async deleteRestaurant(id: string): Promise<boolean> {
        const restaurant = await restaurantRepository.findOneBy({ id });
        if (!restaurant) {
            return false;
        }

        await restaurantRepository.remove(restaurant);
        return true;
    }
}