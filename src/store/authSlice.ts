import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id:       payload.sub as string,
      email:    payload.email as string,
      role:     payload.role as AuthUser['role'],
      clientId: (payload.clientId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

const storedToken = localStorage.getItem('ip_token');

const initialState: AuthState = {
  token: storedToken,
  user:  storedToken ? parseJwtPayload(storedToken) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string }>) {
      const { token } = action.payload;
      state.token = token;
      state.user  = parseJwtPayload(token);
      localStorage.setItem('ip_token', token);
    },
    clearCredentials(state) {
      state.token = null;
      state.user  = null;
      localStorage.removeItem('ip_token');
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
