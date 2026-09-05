import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { User } from "./user.entity";

export enum StaffRole {
    Owner = "Owner",
    Chef = "Chef",
    Waiter = "Waiter",
    Manager = "Manager",
}

@Entity("staff_member")
export class StaffMember {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.staff)
    restaurant!: Restaurant;

    @ManyToOne(() => User)
    user!: User;

    @Column({ type: "enum", enum: StaffRole })
    staffRole!: StaffRole;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;
}
