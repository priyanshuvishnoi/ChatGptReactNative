import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Message } from "../../@types";
import { ChatEntity } from "./Chat";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({
        enum: ['user', 'assistant', 'system']
    })
    type: 'user' | 'assistant' | 'system';

    @Column()
    text: string;

    @Column({
        type: 'simple-array',
    })
    images: string[];

    @ManyToOne(() => ChatEntity, c => c.messages)
    chat: ChatEntity;

    constructor(message: Message) {
        this.type = message?.type ?? null;
        this.text = message?.text ?? null;
        this.images = message?.images ?? [];
    }

    toMessage(): Message {
        return {
            id: this.id,
            type: this.type,
            text: this.text,
            images: this.images,
        }
    }
}