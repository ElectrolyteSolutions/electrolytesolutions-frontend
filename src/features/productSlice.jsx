import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

export const getProducts = createAsyncThunk('products/get', async () => {
    const res = await axios.get(API_URL);
    return res.data;
});

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