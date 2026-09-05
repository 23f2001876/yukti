import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { MenuItems } from "./menuItems.entity";

@Unique(["restaurant", "name"])
@Entity("category")
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Restaurant)
    restaurant!: Restaurant;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "int", default: 0 })
    displayOrder!: number;

    @OneToMany(() => MenuItems, (menuItem) => menuItem.category)
    menuItems!: MenuItems[];
}
