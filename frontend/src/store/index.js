import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducers, will replace as we build slices
const rootReducer = {
    // auth: authReducer,
    // ui: uiReducer
};

export const store = configureStore({
    reducer: rootReducer,
});
