/**
 * This file is used to create a Redux store and configure it with the necessary middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import {apiSlice} from "./slices/apiSlice";

// Create a Redux store holding the state of your app
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
       
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(apiSlice.middleware), 
    devTools: process.env.NODE_ENV !== "production",
});

export default store;