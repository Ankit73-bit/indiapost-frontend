import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import { baseApi } from './api/baseApi';

// ─── Register all injected endpoint modules ───────────────────────────────────
import './api/authApi';
import './api/clientsApi';
import './api/listsApi';
import './api/articlesApi';
import './api/syncApi';
import './api/usersApi';
import './api/noticeTemplatesApi';
import './api/noticeConfigsApi';
import './api/noticeExcelsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
