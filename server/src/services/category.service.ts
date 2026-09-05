import { AppDataSource } from "../data-source";
import { Category } from "../entities/category.entity";

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryService {
    static async getCategoriesByRestaurant(restaurantId: string): Promise<Category[]> {
        return await categoryRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: { menuItems: true },
            order: { displayOrder: "ASC" },
        });
    }

    static async createCategory(data: {
        restaurantId: string;
        name: string;
        displayOrder?: number;
    }): Promise<Category> {
        const { restaurantId, ...rest } = data;

        const category = categoryRepository.create({
            ...rest,
            restaurant: { id: restaurantId },
        });

        return await categoryRepository.save(category);
    }

    static async updateCategory(
        id: string,
        data: Partial<{
            name: string;
            displayOrder: number;
        }>
    ): Promise<Category | null> {
        const category = await categoryRepository.findOneBy({ id });
        if (!category) {
            return null;
        }

        Object.assign(category, data);
        return await categoryRepository.save(category);
    }

    static async deleteCategory(id: string): Promise<boolean> {
        const category = await categoryRepository.findOneBy({ id });
        if (!category) {
            return false;
        }

        await categoryRepository.remove(category);
        return true;
    }
}
