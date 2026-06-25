import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/store/api/authApi';
import { setUser } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginSchema, type LoginFormValues } from '@/pages/login/loginPage.schemas';

function getLoginErrorMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'error' in error.data &&
    typeof error.data.error === 'string'
  ) {
    return error.data.error;
  }
  if (error !== undefined && error !== null) {
    return 'Login failed';
  }
  return null;
}

export function useLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const sessionChecked = useAppSelector((s) => s.auth.sessionChecked);
  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (sessionChecked && user) navigate('/', { replace: true });
  }, [sessionChecked, user, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const res = await login(values).unwrap();
      dispatch(setUser(res.data.user));
      navigate('/');
    } catch {
      // error is handled via RTK error state below
    }
  }

  const apiError = error && 'data' in error ? (getLoginErrorMessage(error) ?? 'Login failed') : null;

  return {
    form,
    isLoading,
    apiError,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
