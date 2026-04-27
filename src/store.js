import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import listReducer from './features/listSlice';
import historyReducer from './features/historySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    list: listReducer,
    history: historyReducer,
  },
});
