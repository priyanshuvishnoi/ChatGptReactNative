import {configureStore} from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';
import messageReducer from './slices/messageSlice';
import commonReducer from './slices/commonSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    chat: chatReducer,
    message: messageReducer,
    common: commonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
