import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}users/`;

// Check localStorage on initial load
const storedUser = JSON.parse(localStorage.getItem('user')) || null;
const storedToken = localStorage.getItem('token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
  sessions: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Helper for Auth Headers
const getAuthConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.token;
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// ⚡ Async Thunks
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    return response.data; // { _id, name, email, role, token }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'login', userData);
    return response.data; // { _id, name, email, role, token }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getUserProfile = createAsyncThunk('auth/getProfile', async (userData, thunkAPI) => {
  try {
    const response = await axios.get(API_URL + 'profile', getAuthConfig(thunkAPI));
    console.log(getAuthConfig(thunkAPI))
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const response = await axios.put(API_URL + 'profile', userData, getAuthConfig(thunkAPI));
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const getActiveSessions = createAsyncThunk('auth/getSessions', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL + 'sessions', getAuthConfig(thunkAPI));
    return response.data; // { count, activeSessions }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const logoutAllDevices = createAsyncThunk('auth/logoutAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await axios.post(API_URL + 'logout-all', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// ⚡ Async Thunk to Terminate a Specific Session
export const terminateSession = createAsyncThunk('auth/terminateSession', async (sessionId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await axios.delete(API_URL + `sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return sessionId; // Return the ID so we can filter it out of the state
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.sessions = [];
      localStorage.clear()
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; state.isSuccess = true; })
      .addCase(registerUser.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })
      .addCase(logoutAllDevices.fulfilled, (state) => {
          state.user = null;
          state.token = null;
          state.sessions = [];
          localStorage.clear()
        })
      .addCase(terminateSession.fulfilled, (state, action) => {
          // Remove the terminated session from the sessions array immediately
          state.sessions = state.sessions.filter(s => s.sessionId !== action.payload);
          state.message = 'Session terminated successfully';
        })
      // Login
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { token, ...userData } = action.payload;
        state.user = userData;
        state.token = token;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', JSON.stringify(token));
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })

      // Get Profile
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const { token, sessions, ...userData } = action.payload;
        state.user = userData;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => { state.isLoading = true; })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Merge updated fields while keeping existing identifiers intact
        state.user = { ...state.user, ...action.payload };
        state.message = 'Profile updated successfully';
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })

      // Get Sessions
      .addCase(getActiveSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.activeSessions;
      });

      
  },
});

export const { resetState, logout } = authSlice.actions;
export default authSlice.reducer;