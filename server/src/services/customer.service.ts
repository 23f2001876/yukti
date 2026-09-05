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

    static async getOrCreateCustomerForUser(userId: string): Promise<Customer> {
        let customer = await customerRepository.findOne({
            where: { user: { id: userId } },
            relations: { user: true },
        });

        if (!customer) {
            customer = customerRepository.create({
                user: { id: userId },
                isGuest: false,
            });
            customer = await customerRepository.save(customer);
        }

        return customer;
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

    static async getOrCreateGuestCustomer(existingCustomerId?: string): Promise<Customer> {
        if (existingCustomerId) {
            const existing = await customerRepository.findOneBy({ id: existingCustomerId });
            if (existing && existing.isGuest) {
                return existing;
            }
        }

        return await this.createCustomer({ isGuest: true });
    }

    static async getOrdersByCustomerId(customerId: string) {
        const orderRepository = AppDataSource.getRepository("orders");
        return await orderRepository.find({
            where: { customerId },
            relations: {
                restaurant: true,
                orderItems: { menuItem: true },
                bill: true,
            },
            order: { createdAt: "DESC" },
        });
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
