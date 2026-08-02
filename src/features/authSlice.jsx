import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}users/`;

// Check localStorage on initial load

const storedToken = localStorage.getItem('token') || null;

const initialState = {
  role: storedToken? jwtDecode(storedToken)?.role : null,
  token: storedToken,
  profileData:null,
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
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    // Check if the error is 401 Unauthorized or 404 Not Found
    if (status === 401 || status === 404) {
      // Dispatch your logout action (replace 'auth/logout' with your actual logout action or function)
      thunkAPI.dispatch(logout());
      navigate("/") 
    }

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
      state.profileData = null,
      state.token =null,
      state.role=null
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
          dispatch(logout())
        })
      .addCase(terminateSession.fulfilled, (state, action) => {
          // Remove the terminated session from the sessions array immediately
          state.sessions = state.sessions.filter(s => s.sessionId !== action.payload);
          state.message = 'Session terminated successfully';
        })
      // Login
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, ...userData } = action.payload;
        state.isLoading = false;
        state.isSuccess = true;
        state.role = userData?.role;
        state.profileData = userData;
        state.token = token;
        state.message = action.payload
        localStorage.setItem('token',token);
      })
      .addCase(loginUser.rejected, (state, action) => { state.isLoading = false; state.isError = true; state.message = action.payload; })

      // Get Profile
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const { token, sessions, ...userData } = action.payload;
        state.profileData = userData;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => { state.isLoading = true; })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Merge updated fields while keeping existing identifiers intact
        state.profileData = action.payload;
        state.message = 'Profile updated successfully';
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