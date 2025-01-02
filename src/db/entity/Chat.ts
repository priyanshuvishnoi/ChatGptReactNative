import { OneToMany, UpdateDateColumn } from "typeorm";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MessageEntity } from "./Message";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToMany(() => MessageEntity, m => m.chat, { cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    messages: MessageEntity[];
}
