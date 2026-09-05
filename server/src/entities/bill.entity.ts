import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Orders } from "./order.entity";
import { Restaurant } from "./restaurant.entity";
import { Customer } from "./customer.entity";

export enum PaymentStatus {
    Pending = "Pending",
    Paid = "Paid",
    Refunded = "Refunded",
    Failed = "Failed",
}

export enum PaymentMethod {
    Cash = "Cash",
    Card = "Card",
    UPI = "UPI",
}

@Entity("bills")
export class Bill {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.bills)
    restaurant!: Restaurant;

    @ManyToOne(() => Customer, (customer) => customer.bills, { nullable: true })
    customer?: Customer | null;

    @Column({ type: "varchar", nullable: true })
    tableNumber?: string | null;

    @OneToMany(() => Orders, (order) => order.bill)
    orders!: Orders[];

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    subtotal!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    tax!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    total!: number;

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.Pending })
    paymentStatus!: PaymentStatus;

    @Column({ type: "enum", enum: PaymentMethod, nullable: true })
    paymentMethod!: PaymentMethod | null;

    @Column({ type: "timestamp", nullable: true })
    paidAt!: Date | null;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;
}
