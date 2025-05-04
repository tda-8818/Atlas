/**
 * This file is used to create a Redux store and configure it with the necessary middleware.
 */

import { configureStore } from "@reduxjs/toolkit";
import {apiSlice} from "./slices/apiSlice";
import projectReducer from './slices/projectSlice';


// Create a Redux store holding the state of your app
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        project: projectReducer,
       
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(apiSlice.middleware), 
    devTools: process.env.NODE_ENV !== "production",
});

console.log("Store initialised:", store.getState());

export default store;