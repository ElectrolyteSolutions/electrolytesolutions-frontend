import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}billings`;

// --- Asynchronous Thunks ---

// Fetch the complete invoice history database
export const getBills = createAsyncThunk('bills/get', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) { 
    return rejectWithValue(err.response?.data || { message: "Failed to fetch invoices" }); 
  }
});

// Process a brand new checkout transaction (Deducts stock on backend)
export const createInvoice = createAsyncThunk('bills/create', async (billData, { rejectWithValue }) => {
  try {
    const res = await axios.post(API_URL, billData);
    return res.data;
  } catch (err) { 
    // This catches business rule validations like "Insufficient stock"
    return rejectWithValue(err.response?.data || { message: "Invoice transaction failed" }); 
  }
});

// Delete an invoice record (Cleans up cross-references on backend)
export const deleteBill = createAsyncThunk('bills/delete', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: "Failed to delete invoice" });
  }
});

// --- State Slice Management ---

const billingSlice = createSlice({
  name: 'bills',
  initialState: { 
    items: [], 
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null 
  },
  reducers: {
    // Standard synchronous reducer to reset error alerts between checkout attempts
    clearBillingErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // GET BILLS LIFECYCLE
      .addCase(getBills.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getBills.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getBills.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "An unexpected error occurred";
      })

      // CREATE INVOICE LIFECYCLE
      .addCase(createInvoice.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload); // Instantly adds new invoice to top of live arrays
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Transaction processing rejected";
      })

      // DELETE BILL LIFECYCLE
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.items = state.items.filter(bill => bill._id !== action.payload);
      });
  }
});

export const { clearBillingErrors } = billingSlice.actions;
export default billingSlice.reducer;