import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import mentorsReducer from './slices/mentorsSlice';
import webinarsReducer from './slices/webinarsSlice';
import placementReducer from './slices/placementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    mentors: mentorsReducer,
    webinars: webinarsReducer,
    placement: placementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'placement/uploadResource'],
        ignoredActionPaths: ['payload.file', 'meta.arg.file', 'payload.createdAt', 'payload.updatedAt'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.updatedAt', 'placement.resources'],
      },
    }),
});
