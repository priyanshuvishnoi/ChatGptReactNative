import { PayloadAction } from '@reduxjs/toolkit';
import type { ChatGPTResponse, Message, MessagesToSend } from '../../@types';
import { dataSource } from '../../db';
import { ChatEntity } from '../../db/entity/Chat';
import { getClient } from '../../utils/client';
import { RootState } from '../store';
import { createAppSlice } from './appSlice';

export interface MessageState {
  value: Message[];
}

const initialState: MessageState = {
  value: [
    {
      id: '1',
      type: 'system',
      text: 'send messages in markdown format',
      images: []
    },
  ],
};

export const messageSlice = createAppSlice({
  name: 'message',
  initialState,
  reducers: create => ({
    addMessage: create.reducer((state, action: PayloadAction<Message>) => {
      state.value.push(action.payload);
    }),
    sendMessage: create.asyncThunk(
      async (message: Message, { getState, dispatch }) => {
        const messages: Message[] = (getState() as RootState).message.value;
        dispatch(addMessage(message));

        let messagePart = messages;
        if (messages.length > 11) {
          messagePart = [messages[0]].concat(messages.slice(-10));
        }

        const messagesToSend: MessagesToSend = messagePart.map(m => {
          if (m.images?.length) {
            return {
              role: m.type,
              content: [
                {
                  type: 'text',
                  text: m.text,
                },
                ...m.images.map(image => ({
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                }))
              ],
            };
          } else {
            return {
              role: m.type,
              content: [
                {
                  type: 'text',
                  text: m.text,
                },
              ],
            };
          }
        });

        if (message.images?.length) {
          messagesToSend.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: message.text,
              },
              ...message.images.map(image => (
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                  },
                }
              ))
            ],
          });
        } else {
          messagesToSend.push({
            role: 'user',
            content: message.text,
          });
        }
        return ''
        try {

          const client = await getClient();
          const res = await client.post<ChatGPTResponse>('', {
            model: 'gpt-4o-mini',
            messages: messagesToSend,
            temperature: 0.7,
          });
          return res?.data?.choices[0]?.message?.content;
        } catch (error) {
          console.log(error);
        }

      },
      {
        fulfilled: (state, action) => {
          state.value.push({
            id: Date.now().toString(),
            type: 'assistant',
            text: action.payload,
            images: []
          });
        },
      },
    ),
    clearChat: create.reducer(state => {
      state.value = []
    }),
    loadMessagesFromDB: create.asyncThunk(
      async (chatId?: number) => {
        if (!chatId) return [];

        const chatRepo = dataSource.getRepository<ChatEntity>(ChatEntity);
        const chats = await chatRepo.find({ where: { id: chatId }, relations: { messages: true } });
        if (chats.length === 0) return [];
        const chat = chats[0];
        return chat?.messages;
      },
      {
        fulfilled: (state, action) => {
          state.value = action.payload.map(m => m.toMessage())
          console.log(state.value)
        },
      },
    ),
  }),
});

export const { loadMessagesFromDB, sendMessage, clearChat, addMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
