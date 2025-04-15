/**
 * Manages authentication state.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// verify
const initialState = {
  user: null,
  isLoading: false,
  error: null
};

// Add async thunk to make api call to server to check if user's token is still valid
export const verifyAuth = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/users/me', { 
        withCredentials: true 
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserCredentials: (state, action) => {
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.user = null;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    }
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;