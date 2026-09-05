import { AppDataSource } from "../data-source";
import { Customer } from "../entities/customer.entity";

const customerRepository = AppDataSource.getRepository(Customer);

export class CustomerService {
    static async getAllCustomers(): Promise<Customer[]> {
        return await customerRepository.find({
            relations: { user: true },
        });
    }

    static async getCustomerById(id: string): Promise<Customer | null> {
        return await customerRepository.findOne({
            where: { id },
            relations: { user: true, orders: true },
        });
    }

    static async createCustomer(data: {
        userId?: string;
        isGuest?: boolean;
    }): Promise<Customer> {
        const { userId, ...rest } = data;

        const customer = customerRepository.create({
            ...rest,
            user: userId ? { id: userId } : null,
        });

        return await customerRepository.save(customer);
    }

    static async deleteCustomer(id: string): Promise<boolean> {
        const customer = await customerRepository.findOneBy({ id });
        if (!customer) {
            return false;
        }

        await customerRepository.remove(customer);
        return true;
    }
}
