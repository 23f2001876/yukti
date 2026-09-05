import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StaffMember } from "./staffMember.entity";
import { MenuItems } from "./menuItems.entity";
import { Orders } from "./order.entity";
import { Bill } from "./bill.entity";

@Entity("restaurant")
export class Restaurant {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", unique: true })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @Column({ type: "varchar" })
    address!: string;

    @Column({ type: "varchar" })
    phone!: string;

    @Column({ type: "varchar", nullable: true })
    email!: string;

    @Column({ type: "varchar", nullable: true })
    openingHours!: string;

    @Column({ type: "varchar", nullable: true })
    logoUrl!: string;

    @Column({ type: "boolean", default: false })
    isBanned!: boolean;

    @ManyToOne(() => StaffMember, { nullable: true })
    @JoinColumn({ name: "ownerId" })
    owner!: StaffMember | null;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;

    @OneToMany(() => MenuItems, (menuItem) => menuItem.restaurant)
    menuItems!: MenuItems[];

    @OneToMany(() => StaffMember, (staff) => staff.restaurant)
    staff!: StaffMember[];

    @OneToMany(() => Orders, (order) => order.restaurant)
    orders!: Orders[];

    @OneToMany(() => Bill, (bill) => bill.restaurant)
    bills!: Bill[];
}