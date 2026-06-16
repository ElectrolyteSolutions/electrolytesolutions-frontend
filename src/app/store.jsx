import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/productSlice';
import customerReducer from '../features/customerSlice';
import deviceReducer from '../features/deviceSlice';
import billingReducer from '../features/billingSlice';
import authReducer from '../features/authSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    customers: customerReducer,
    devices: deviceReducer,
    billings: billingReducer,
    auth: authReducer,
    // Add other features here as you scale
  },
  // DevTools is enabled by default in development mode
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Useful when dealing with complex date objects from APIs
    }),
});