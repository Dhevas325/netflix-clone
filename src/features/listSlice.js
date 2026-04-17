import { createSlice } from '@reduxjs/toolkit';

export const listSlice = createSlice({
  name: 'list',
  initialState: {
    myList: [],
  },
  reducers: {
    addToList: (state, action) => {
      // Check if movie already exists in list to avoid duplicates
      if (!state.myList.find(item => item.id === action.payload.id)) {
        state.myList.push(action.payload);
      }
    },
    removeFromList: (state, action) => {
      state.myList = state.myList.filter(item => item.id !== action.payload.id);
    },
  },
});

export const { addToList, removeFromList } = listSlice.actions;

export const selectList = (state) => state.list.myList;

export default listSlice.reducer;
