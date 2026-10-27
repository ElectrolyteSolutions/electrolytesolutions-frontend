import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}products`;

// Helper for Auth Headers
const getAuthConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// ⚡ Updated: Dynamic async thunk supporting search, filters, and matrix sorting layouts
export const getProducts = createAsyncThunk(
  'products/get',
  async (filterParams = {}, thunkAPI) => {
    try {
      const { alert, search, sortBy, sortOrder, brand, modelName } = filterParams;
      
      const queryPayload = {};

      if (alert) queryPayload.alert = alert;
      if (search) queryPayload.search = search;
      if (sortBy) queryPayload.sortBy = sortBy;
      if (sortOrder) queryPayload.sortOrder = sortOrder;
      if (brand) queryPayload.brand = brand;
      if (modelName) queryPayload.modelName = modelName;

      const config = {
        ...getAuthConfig(thunkAPI),
        params: queryPayload,
      };

      const res = await axios.get(API_URL, config);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addProduct = createAsyncThunk('products/add', async (item, thunkAPI) => {
  try {
    const res = await axios.post(API_URL, item, getAuthConfig(thunkAPI));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data, getAuthConfig(thunkAPI));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig(thunkAPI));
    return id;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const productSlice = createSlice({
    name: 'products',
    initialState: { 
      items: [], 
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      error: null 
    },
    extraReducers: (builder) => {
        builder
            // Get Products
            .addCase(getProducts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Add Product
            .addCase(addProduct.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.unshift(action.payload);
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.items.findIndex(i => i._id === action.payload._id);
                if (index !== -1) {
                  state.items[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = state.items.filter(i => i._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default productSlice.reducer;