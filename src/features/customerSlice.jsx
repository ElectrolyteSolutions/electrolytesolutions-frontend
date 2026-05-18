import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.VITE_API_URL}customers`;

// --- Thunks ---

export const getCustomers = createAsyncThunk('customers/get', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const addCustomer = createAsyncThunk('customers/add', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id; // Return the ID so we can filter it out of the state
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

// --- Slice ---

const customerSlice = createSlice({
  name: 'customers',
  initialState: { 
    items: [], 
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null 
  },
  reducers: {
    // Standard reducers can go here if needed (e.g., clearError)
  },
  extraReducers: (builder) => {
    builder
      // GET CUSTOMERS
      .addCase(getCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ADD CUSTOMER
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // UPDATE CUSTOMER
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE CUSTOMER
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  }
});

export default customerSlice.reducer;