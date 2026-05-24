import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}products`;



// ⚡ Updated: Dynamic async thunk supporting search, filters, and matrix sorting layouts
export const getProducts = createAsyncThunk(
  'products/get',
  async (filterParams = {}, { rejectWithValue }) => {
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

      // Pass the query dictionary configuration parameters into the config payload block
      const res = await axios.get(API_URL, { params: queryPayload });
      return res.data;
    } catch (err) {
      // Gracefully catch pipeline drops or connection timeouts safely
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addProduct = createAsyncThunk('products/add', async (item) => {
    const res = await axios.post(API_URL, item);
    return res.data;
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }) => {
    
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
});

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
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
                state.items[index] = action.payload;
            });
    }
});

export default productSlice.reducer;