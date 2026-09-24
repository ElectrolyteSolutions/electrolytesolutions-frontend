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
      // Destructure expected variables out to track configurations cleanly
      const { alert, search, sortBy, sortOrder, brand, modelName } = filterParams;
      
      const queryPayload = {};

      // Hot-append active state parameters dynamically onto the URL query payload
      if (alert) queryPayload.alert = alert;
      if (search) queryPayload.search = search;
      if (sortBy) queryPayload.sortBy = sortBy;
      if (sortOrder) queryPayload.sortOrder = sortOrder;
      if (brand) queryPayload.brand = brand;
      if (modelName) queryPayload.modelName = modelName;

      // Pass the query dictionary configuration parameters along with auth headers into the config payload block
      const config = {
        ...getAuthConfig(thunkAPI),
        params: queryPayload,
      };

      const res = await axios.get(API_URL, config);
      return res.data;
    } catch (err) {
      // Gracefully catch pipeline drops or connection timeouts safely
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
    initialState: { items: [], loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.fulfilled, (state, action) => { state.items = action.payload; })
            .addCase(addProduct.fulfilled, (state, action) => { state.items.unshift(action.payload); })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(i => i._id !== action.payload);
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(i => i._id === action.payload._id);
                if (index !== -1) {
                  state.items[index] = action.payload;
                }
            });
    }
});

export default productSlice.reducer;