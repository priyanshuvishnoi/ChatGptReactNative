import {configureStore} from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';
import messageReducer from './slices/messageSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
