import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    activeProfile: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.activeProfile = null;
    },
    setProfile: (state, action) => {
      state.activeProfile = action.payload;
    }
  },
});

export const { login, logout, setProfile } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectActiveProfile = (state) => state.user.activeProfile;

export default userSlice.reducer;
