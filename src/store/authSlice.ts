import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, PublicUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  /** True once the initial session check (GET /users/me) has finished. */
  sessionChecked: boolean;
}

function toAuthUser(user: PublicUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    clientId: user.clientId,
  };
}

const initialState: AuthState = {
  user: null,
  sessionChecked: false,
};

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { dispatch }) => {
    const { usersApi } = await import('./api/usersApi');
    try {
      const user = await dispatch(
        usersApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
      ).unwrap();
      return toAuthUser(user);
    } catch {
      return null;
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    updateUser(state, action: PayloadAction<{ name?: string }>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearCredentials(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.sessionChecked = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.sessionChecked = true;
      });
  },
});

export const { setUser, updateUser, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
