import { PayloadAction } from '@reduxjs/toolkit';
import { ChatGPTResponse, Message, MessagesToSend } from '../../@types';
import { getClient } from '../../utils/client';
import * as DB from '../../utils/db';
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
          if (m.image) {
            return {
              role: m.type,
              content: [
                {
                  type: 'text',
                  text: m.text,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${m.image}`,
                  },
                },
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

        if (message.image) {
          messagesToSend.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: message.text,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${message.image}`,
                },
              },
            ],
          });
        } else {
          messagesToSend.push({
            role: 'user',
            content: message.text,
          });
        }


        const client = await getClient();
        const res = await client.post<ChatGPTResponse>('', {
          model: 'gpt-4o-mini',
          messages: messagesToSend,
          temperature: 0.7,
        });

        return res?.data?.choices[0]?.message?.content;
      },
      {
        fulfilled: (state, action) => {
          state.value.push({
            id: Date.now().toString(),
            type: 'assistant',
            text: action.payload,
          });
        },
      },
    ),
    clearChat: create.reducer(state => {
      state.value = []
    }),
    loadMessagesFromDB: create.asyncThunk(
      (chatId?: number) => {
        if (!chatId) return [];
        return DB.getMessages(chatId);
      },
      {
        fulfilled: (state, action) => {
          state.value = action.payload;
        },
      },
    ),
  }),
});

export const { loadMessagesFromDB, sendMessage, clearChat, addMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
