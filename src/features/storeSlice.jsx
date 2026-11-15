import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}policies/`;

// Fetch Store Info & Policies (Public)
export const fetchStoreInfo = createAsyncThunk(
  'store/fetchStoreInfo', 
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Store Info & Policies (Admin Only)
export const updateStoreInfo = createAsyncThunk(
  'store/updateStoreInfo', 
  async (storeData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.put(API_URL, storeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.storeInfo;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState: {
    storeInfo: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetStoreState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Store Info
      .addCase(fetchStoreInfo.pending, (state) => { 
        state.isLoading = true; 
      })
      .addCase(fetchStoreInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.storeInfo = action.payload;
      })
      .addCase(fetchStoreInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update Store Info (Admin)
      .addCase(updateStoreInfo.pending, (state) => { 
        state.isLoading = true; 
        state.isSuccess = false;
      })
      .addCase(updateStoreInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.storeInfo = action.payload;
        state.message = 'Store information updated successfully';
      })
      .addCase(updateStoreInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetStoreState } = storeSlice.actions;
export default storeSlice.reducer;