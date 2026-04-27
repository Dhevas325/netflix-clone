import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recentSearches: JSON.parse(localStorage.getItem('recentSearches')) || [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action) => {
      const { movie, server } = action.payload; // Payload now contains movie info and server index
      if (!movie || !movie.id) return;
      
      const movieItem = {
        ...movie,
        lastServer: server || 1, // Default to server 1 if not provided
        timestamp: Date.now()
      };

      // Remove if exists to move it to the top (uniqueness)
      state.recentSearches = state.recentSearches.filter(item => item.id !== movie.id);
      
      // Add to start and limit to 20 items
      state.recentSearches.unshift(movieItem);
      state.recentSearches = state.recentSearches.slice(0, 20);
      
      localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    },
    removeFromHistory: (state, action) => {
      state.recentSearches = state.recentSearches.filter(q => String(q.id) !== String(action.payload));
      localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    },
    clearHistory: (state) => {
      state.recentSearches = [];
      localStorage.removeItem('recentSearches');
    }
  },
});

export const { addToHistory, removeFromHistory, clearHistory } = historySlice.actions;
export const selectHistory = (state) => state.history.recentSearches;
export default historySlice.reducer;
