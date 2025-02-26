import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // Will hold the user data (email, token, etc.)
  isAuthenticated: false,  // Boolean indicating if the user is logged in
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;  // Store user data
      state.isAuthenticated = true;  // Set isAuthenticated to true
    },
    logout: (state) => {
      state.user = null;  // Clear user data
      state.isAuthenticated = false;  // Set isAuthenticated to false
    },
  },
});

export const { login, logout } = authSlice.actions;


export default authSlice.reducer;
