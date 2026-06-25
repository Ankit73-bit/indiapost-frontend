import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiBaseUrl } from '@/lib/apiBase';
import { registerSchema } from '@/pages/users/usersPage.constants';
import type { RegisterFormValues } from '@/pages/users/usersPage.types';

interface UseRegisterUserDialogOptions {
  onClose: () => void;
}

export function useRegisterUserDialog({ onClose }: UseRegisterUserDialogOptions) {
  const apiUrl = getApiBaseUrl() || window.location.origin;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' },
  });
  const role = form.watch('role');

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Registration failed');
      }
      form.reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return {
    form,
    role,
    loading,
    error,
    onSubmit,
  };
}
