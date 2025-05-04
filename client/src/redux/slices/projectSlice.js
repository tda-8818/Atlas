// file: projectSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedProjectId: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProjectId: (state, action) => {
      state.selectedProjectId = action.payload;
    },
  },
});

export const { setSelectedProjectId } = projectSlice.actions;
export default projectSlice.reducer;