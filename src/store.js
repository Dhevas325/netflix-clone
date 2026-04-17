import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import listReducer from './features/listSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    list: listReducer,
  },
});
