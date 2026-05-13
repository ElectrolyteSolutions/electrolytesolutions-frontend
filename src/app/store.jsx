import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/productSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    // Add other features here as you scale
  },
  // DevTools is enabled by default in development mode
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Useful when dealing with complex date objects from APIs
    }),
});