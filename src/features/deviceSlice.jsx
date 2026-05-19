import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}devices`;

// --- Thunks ---

// Fetch all devices
export const getDevices = createAsyncThunk('devices/get', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Failed to fetch devices");
  }
});

// Register a new device
export const addDevice = createAsyncThunk('devices/add', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Failed to add device");
  }
});

// Update device details or repair status
export const updateDevice = createAsyncThunk('devices/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Failed to update device");
  }
});

// Delete device record
export const deleteDevice = createAsyncThunk('devices/delete', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Failed to delete device");
  }
});

// --- Slice ---

const deviceSlice = createSlice({
  name: 'devices',
  initialState: { 
    items: [], 
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null 
  },
  reducers: {
    // Optional: Reset error state when closing modals
    clearDeviceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // GET DEVICES
      .addCase(getDevices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getDevices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getDevices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // ADD DEVICE
      .addCase(addDevice.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      // UPDATE DEVICE (Handles status changes: in-progress -> resolved)
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.items.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // DELETE DEVICE
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d._id !== action.payload);
      });
  }
});

export const { clearDeviceError } = deviceSlice.actions;
export default deviceSlice.reducer;