/**
 * This file is used to create a Redux store and configure it with the necessary middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import { userApiSlice } from "./slices/userSlice";
import { projectApiSlice } from './slices/projectSlice';
import { taskApiSlice } from './slices/taskSlice';


// Create a Redux store holding the state of your app
const store = configureStore({
    reducer: {
      // Register each API slice's reducer using their respective reducer paths
      [userApiSlice.reducerPath]: userApiSlice.reducer,
      [taskApiSlice.reducerPath]: taskApiSlice.reducer,
      [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        userApiSlice.middleware,
        taskApiSlice.middleware,
        projectApiSlice.middleware
      ),
    devTools: process.env.NODE_ENV !== 'production',
  });
  
  console.log('Store initialised:', store.getState());
  

export default store;