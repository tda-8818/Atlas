/**
 * Manages authentication state with JWT support
 */
import { createSlice } from "@reduxjs/toolkit";

// Helper function to get initial state from localStorage
const getInitialState = () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  return {
    user: user ? JSON.parse(user) : null,
    token: token || null,
    isAuthenticated: !!token, // Authentication status based on token presence
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUserCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;