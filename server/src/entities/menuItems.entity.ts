import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { Category } from "./category.entity";

@Entity("menu_items")
export class MenuItems {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems)
    restaurant!: Restaurant;

    @ManyToOne(() => Category, (category) => category.menuItems)
    category!: Category;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", nullable: true })
    description!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price!: number;

    @Column({ type: "varchar", nullable: true })
    imageUrl!: string;

    @Column({ type: "boolean", default: true })
    isAvailable!: boolean;

    @Column({ type: "int", default: 0 })
    sortOrder!: number;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;
}