import type { Chat, Message } from '../../@types';
import { dataSource } from '../../db';
import { ChatEntity } from '../../db/entity/Chat';
import { MessageEntity } from '../../db/entity/Message';
import { createAppSlice } from './appSlice';

export interface ChatState {
  value: Chat[];
}

const initialState: ChatState = {
  value: [],
};

export type SaveChatToDBPayload = {
  title: string;
  messages: Message[];
  chatId?: number;
};

export type UpdateChatPayload = {
  chatId: number;
  messages: Message[];
};

export const chatSlice = createAppSlice({
  name: 'chat',
  initialState,
  reducers: create => ({
    saveChatToDB: create.asyncThunk(async (payload: SaveChatToDBPayload) => {
      try {
        const chatRepo = dataSource.getRepository(ChatEntity);

        const messageEntities = payload.messages.map(m => new MessageEntity(m));

        const chat = new ChatEntity();
        chat.title = payload.title;
        chat.messages = messageEntities;
        await chatRepo.save(chat);
      } catch (e) {
        console.log(e);
      }
    }),

    updateChat: create.asyncThunk(async (payload: UpdateChatPayload) => {
      const chatRepo = dataSource.getRepository(ChatEntity);

      const chats = await chatRepo.find({ where: { id: payload.chatId }, relations: { messages: true } });
      if (!chats?.length) return;

      const chat = chats[0];
      const messageEntities = payload.messages.map(m => new MessageEntity(m));
      const existingMessages = chat.messages;
      chat.messages = existingMessages.concat(messageEntities);
      await chatRepo.save(chat);
    }),

    deleteChatFromDB: create.asyncThunk(
      async (chatId: number): Promise<Chat[]> => {
        const chatRepo = dataSource.getRepository(ChatEntity);
        try {
          const chat = await chatRepo.findOneBy({ id: chatId });
          if (!chat) return;
          await chatRepo.remove(chat);
        } catch (e) {
          console.log(e);
        } finally {
          const chats = await chatRepo.find();
          return chats.map(c => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt.toISOString(),
          }));
        }
      },
      {
        fulfilled: (state, action) => {
          state.value = action.payload;
        },
      },
    ),

    loadChatsFromDB: create.asyncThunk(
      async (): Promise<Chat[]> => {
        try {
          const chatRepo = dataSource.getRepository(ChatEntity);
          const chats = await chatRepo.find();
          return chats.map(c => ({
            id: c.id,
            title: c.title,
            createdAt: c.createdAt.toISOString(),
          }));
        } catch (e) {
          return [];
        }
      },
      {
        fulfilled: (state, action) => {
          state.value = action.payload;
        },
      },
    ),
  }),
});

export const { loadChatsFromDB, deleteChatFromDB, saveChatToDB, updateChat } =
  chatSlice.actions;

export default chatSlice.reducer;
