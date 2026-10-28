import { createSlice } from '@reduxjs/toolkit'

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    favourites: [],
    darkMode: true,
    recentSearches: [],
  },
  reducers: {
    addFavourite: (state, action) => {
      const exists = state.favourites.find(c => c === action.payload)
      if (!exists) state.favourites.push(action.payload)
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter(c => c !== action.payload)
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    addRecentSearch: (state, action) => {
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(c => c !== action.payload)
      ].slice(0, 5)
    }
  }
})

export const { addFavourite, removeFavourite, toggleDarkMode, addRecentSearch } = weatherSlice.actions
export default weatherSlice.reducer