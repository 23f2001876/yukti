import { AppDataSource } from "../data-source";
import { MenuItems } from "../entities/menuItems.entity";

const menuItemRepository = AppDataSource.getRepository(MenuItems);

export class MenuItemService {
    static async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItems[]> {
        return await menuItemRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: { category: true },
            order: { sortOrder: "ASC" },
        });
    }

    static async getMenuItemById(id: string): Promise<MenuItems | null> {
        return await menuItemRepository.findOne({
            where: { id },
            relations: { category: true },
        });
    }

    static async createMenuItem(data: {
        restaurantId: string;
        categoryId: string;
        name: string;
        price: number;
        description?: string;
        imageUrl?: string;
        isAvailable?: boolean;
        sortOrder?: number;
    }): Promise<MenuItems> {
        const { restaurantId, categoryId, ...rest } = data;

        const menuItem = menuItemRepository.create({
            ...rest,
            restaurant: { id: restaurantId },
            category: { id: categoryId },
        });

        return await menuItemRepository.save(menuItem);
    }

    static async updateMenuItem(
        id: string,
        data: Partial<{
            name: string;
            price: number;
            description: string;
            imageUrl: string;
            isAvailable: boolean;
            sortOrder: number;
            categoryId: string;
        }>
    ): Promise<MenuItems | null> {
        const menuItem = await menuItemRepository.findOneBy({ id });
        if (!menuItem) {
            return null;
        }

        const { categoryId, ...rest } = data;
        Object.assign(menuItem, rest, { updatedAt: new Date() });

        if (categoryId) {
            menuItem.category = { id: categoryId } as any;
        }

        return await menuItemRepository.save(menuItem);
    }

    static async deleteMenuItem(id: string): Promise<boolean> {
        const menuItem = await menuItemRepository.findOneBy({ id });
        if (!menuItem) {
            return false;
        }

        await menuItemRepository.remove(menuItem);
        return true;
    }
}
