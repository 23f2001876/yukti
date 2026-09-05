import { AppDataSource } from "../data-source";
import { Restaurant } from "../entities/restaurant.entity";

const restaurantRepository = AppDataSource.getRepository(Restaurant);

export class RestaurantService {
    static async getAllRestaurants(): Promise<Restaurant[]> {
        return await restaurantRepository.find();
    }

    static async getRestaurantById(id: string): Promise<Restaurant | null> {
        return await restaurantRepository.findOneBy({ id });
    }

    static async createRestaurant(data: {
        name: string;
        address: string;
        phone: string;
        description?: string;
        email?: string;
        openingHours?: string;
        logoUrl?: string;
    }): Promise<Restaurant> {
        const existingRestaurant = await restaurantRepository.findOneBy({ name: data.name });
        if (existingRestaurant) {
            throw new Error("A restaurant with this name already exists.");
        }

        const restaurant = restaurantRepository.create(data);
        return await restaurantRepository.save(restaurant);
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
            isBanned: boolean;
        }>
    ): Promise<Restaurant | null> {
        const restaurant = await restaurantRepository.findOneBy({ id });
        if (!restaurant) {
            throw new Error("The restaurant does not exists.");
        }

        Object.assign(restaurant, data, { updatedAt: new Date() });
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