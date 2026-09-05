import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Orders } from "./order.entity";
import { Bill } from "./bill.entity";

@Entity("customer")
export class Customer {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { nullable: true })
    user!: User | null;

    @Column({ type: "boolean", default: false })
    isGuest!: boolean;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;

    @OneToMany(() => Orders, (order) => order.customer)
    orders!: Orders[];

    @OneToMany(() => Bill, (bill) => bill.customer)
    bills?: Bill[];
}
