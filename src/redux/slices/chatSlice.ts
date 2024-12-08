import {Chat, Message} from '../../@types';
import * as DB from '../../utils/db';
import {createAppSlice} from './appSlice';

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
      return await DB.saveChatMessages(payload.title, payload.messages);
    }),
    updateChat: create.asyncThunk(async (payload: UpdateChatPayload) => {
      return await DB.updateChat(payload.chatId, payload.messages);
    }),
    deleteChatFromDB: create.asyncThunk(
      async (chatId: number) => {
        await DB.deleteChat(chatId);
        return await DB.getChats();
      },
      {
        fulfilled: (state, action) => {
          state.value = action.payload;
        },
      },
    ),
    loadChatsFromDB: create.asyncThunk(
      async () => {
        try {
          await DB.createTable();
          return await DB.getChats();
        } catch (e) {
          console.log(e);
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

export const {loadChatsFromDB, deleteChatFromDB, saveChatToDB, updateChat} =
  chatSlice.actions;

export default chatSlice.reducer;
