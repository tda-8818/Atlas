/**
 * This file is used to create a Redux store and configure it with the necessary middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import { userApiSlice } from "./slices/userSlice";
import { projectApiSlice } from './slices/projectSlice';
import { taskApiSlice } from './slices/taskSlice';
import { labelApi } from './slices/labelSlice';


// Create a Redux store holding the state of your app
const store = configureStore({
    reducer: {
      // Register each API slice's reducer using their respective reducer paths
      [userApiSlice.reducerPath]: userApiSlice.reducer,
      [taskApiSlice.reducerPath]: taskApiSlice.reducer,
      [projectApiSlice.reducerPath]: projectApiSlice.reducer,
      [labelApi.reducerPath]: labelApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        userApiSlice.middleware,
        taskApiSlice.middleware,
        projectApiSlice.middleware,
        labelApi.middleware
      ),
    devTools: process.env.NODE_ENV !== 'production',
  });

export default store;