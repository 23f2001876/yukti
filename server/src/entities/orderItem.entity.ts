import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Orders } from "./order.entity";
import { MenuItems } from "./menuItems.entity";

@Entity("order_item")
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Orders, (order) => order.orderItems)
    order!: Orders;

    @ManyToOne(() => MenuItems, { onDelete: "RESTRICT" })
    menuItem!: MenuItems;

    @Column({ type: "int", default: 1 })
    quantity!: number;

    @Column({ type: "varchar" })
    itemNameAtOrder!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    priceAtOrder!: number;
}
