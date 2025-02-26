import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // Import the authSlice

const store = configureStore({
  reducer: {
    auth: authReducer,  // Add the auth slice to the store
  },
});

export default store;
