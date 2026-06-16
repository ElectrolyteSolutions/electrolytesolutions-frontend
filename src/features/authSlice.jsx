import { createSlice } from '@reduxjs/toolkit';

// ⚡ Check localStorage on initial load to keep the user logged in across refreshes
const storedUser = JSON.parse(localStorage.getItem('erp_user')) || null;
const storedToken = localStorage.getItem('erp_token') || null;

const initialState = {
  user: storedUser,
  token: storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ⚡ Called when a user successfully logs in or registers
    setCredentials: (state, action) => {
      const { role, token } = action.payload;
      state.user = role                   ;
      state.token = token;
      
      // Save to local storage
      localStorage.setItem('erp_user', JSON.stringify(role));
      localStorage.setItem('erp_token', token);
    },
    
    // ⚡ Called when a user clicks the Logout button
    logout: (state) => {
      state.user = null;
      state.token = null;
      
      // Clear from local storage
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erp_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;