import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar", nullable: true, unique: true })
    phone!: string;

    @Column({ type: "boolean", default: false })
    isAdmin!: boolean;

    @Column({ type: "varchar" })
    passwordHash!: string;

    @Column({ type: "timestamp", default: () => "NOW()" })
    createdAt!: Date;

    @Column({ type: "timestamp", default: () => "NOW()" })
    updatedAt!: Date;
}
