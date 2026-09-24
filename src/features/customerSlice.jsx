import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}customers`;

// Helper for Auth Headers
const getAuthConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// --- Thunks ---

export const getCustomers = createAsyncThunk('customers/get', async (_, thunkAPI) => {
  try {
    const res = await axios.get(API_URL, getAuthConfig(thunkAPI));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const addCustomer = createAsyncThunk('customers/add', async (data, thunkAPI) => {
  try {
    const res = await axios.post(API_URL, data, getAuthConfig(thunkAPI));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateCustomer = createAsyncThunk('customers/update', async ({ id, data }, thunkAPI) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data, getAuthConfig(thunkAPI));
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteCustomer = createAsyncThunk('customers/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig(thunkAPI));
    return id; // Return the ID so we can filter it out of the state
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return thunkAPI.rejectWithValue(message);
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