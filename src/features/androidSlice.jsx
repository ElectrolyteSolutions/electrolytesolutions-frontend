import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL}android/`;

// Async Thunks
export const fetchDevices = createAsyncThunk(
  'android/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}devices`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch devices');
      return data.devices;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDeviceById = createAsyncThunk(
  'android/deleteDeviceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}devices/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete device');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAllDevices = createAsyncThunk(
  'android/deleteAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}devices`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to clear devices');
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendBroadcastNotification = createAsyncThunk(
  'android/sendBroadcastNotification',
  async ({ title, body, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Broadcast failed');
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendToUser = createAsyncThunk(
  'android/sendToUser',
  async ({ userId, title, body, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}send-to-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, body, data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send to user');
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendToAdmin = createAsyncThunk(
  'android/sendToAdmin',
  async ({ title, body, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}send-to-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send to admin');
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const androidSlice = createSlice({
  name: 'android',
  initialState: {
    devices: [],
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Device By ID
      .addCase(deleteDeviceById.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d._id !== action.payload);
        state.successMessage = 'Device deleted successfully';
      })
      // Delete All Devices
      .addCase(deleteAllDevices.fulfilled, (state) => {
        state.devices = [];
        state.successMessage = 'All devices cleared successfully';
      })
      // Broadcast Notification
      .addCase(sendBroadcastNotification.pending, (state) => {
        state.actionLoading = true;
        state.clearMessages?.();
      })
      .addCase(sendBroadcastNotification.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = `Broadcast sent! Success: ${action.payload.successCount}, Fails: ${action.payload.failureCount}`;
      })
      .addCase(sendBroadcastNotification.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Send To User
      .addCase(sendToUser.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(sendToUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Notification sent to user successfully!';
      })
      .addCase(sendToUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Send To Admin
      .addCase(sendToAdmin.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(sendToAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'Notification sent to Admin successfully!';
      })
      .addCase(sendToAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = androidSlice.actions;
export default androidSlice.reducer;