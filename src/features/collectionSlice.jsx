import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for your API utilizing environment variable
const API_URL = `${import.meta.env.VITE_API_URL || '/api/'}collections/`;

// Helper for Authorization Headers if tokens are used
const getAuthConfig = () => {
  const token = localStorage.getItem('token') || '';
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };
};

// 1. Get all collections
export const getCollections = createAsyncThunk(
  'collections/getAll',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data.data; // Matches your backend response structure { success: true, data: [...] }
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 2. Create a new collection (Exported as both createCollection and addCollection for compatibility)
export const createCollection = createAsyncThunk(
  'collections/create',
  async (collectionData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, collectionData, getAuthConfig());
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Alias to match CollectionsPage import statement
export const addCollection = createCollection;

// 3. Update a collection
export const updateCollection = createAsyncThunk(
  'collections/update',
  async ({ id, updateData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}${id}`, updateData, getAuthConfig());
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4. Delete a collection
export const deleteCollection = createAsyncThunk(
  'collections/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}${id}`, getAuthConfig());
      return id; // Return the ID so we can filter it out of state
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  collections: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Collections
      .addCase(getCollections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.collections = action.payload;
      })
      .addCase(getCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create / Add Collection
      .addCase(createCollection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.collections.unshift(action.payload); // Add new item to the top of the list
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Collection
      .addCase(updateCollection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.collections = state.collections.map((col) =>
          col._id === action.payload._id ? action.payload : col
        );
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Collection
      .addCase(deleteCollection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.collections = state.collections.filter(
          (col) => col._id !== action.payload
        );
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = collectionSlice.actions;
export default collectionSlice.reducer;