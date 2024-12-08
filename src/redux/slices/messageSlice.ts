import {ChatGPTResponse, Message} from '../../@types';
import {createAppSlice} from './appSlice';
import * as DB from '../../utils/db';
import {RootState} from '../store';
import client from '../../utils/client';
import {PayloadAction} from '@reduxjs/toolkit';

export interface MessageState {
  value: Message[];
}

const initialState: MessageState = {
  value: [
    {
      id: '1',
      type: 'system',
      text: 'send messages in markdown format',
      image: '',
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
      async (message: Message, {getState, dispatch}) => {
        const messages = (getState() as RootState).message.value;
        dispatch({type: 'message/addMessage', payload: message});
        const messagesToSend: any[] = messages.map(m => {
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
      state.value = [];
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

export const {loadMessagesFromDB, sendMessage, clearChat} =
  messageSlice.actions;

export default messageSlice.reducer;
