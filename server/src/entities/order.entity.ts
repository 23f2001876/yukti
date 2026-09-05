import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Customer } from "./customer.entity";
import { Restaurant } from "./restaurant.entity";
import { OrderItem } from "./orderItem.entity";
import { Bill } from "./bill.entity";

export enum OrderStatus {
    Placed = "Placed",
    Accepted = "Accepted",
    Rejected = "Rejected",
    Preparing = "Preparing",
    Ready = "Ready",
    Delivered = "Delivered",
    Cancelled = "Cancelled",
}

@Entity("orders")
export class Orders {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Customer, (customer) => customer.orders)
    customer!: Customer;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders)
    restaurant!: Restaurant;

    @ManyToOne(() => Bill, (bill) => bill.orders, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "billId" })
    bill?: Bill | null;

    @Column({ type: "varchar", nullable: true })
    tableNumber?: string | null;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.Placed })
    status!: OrderStatus;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    orderItems!: OrderItem[];
}
