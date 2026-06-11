import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/authSlice';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/store';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials({ token: res.data.token }));
      navigate('/');
    } catch {
      // error is handled via RTK error state below
    }
  }

  const apiError =
    error && 'data' in error
      ? ((error.data as { error?: string })?.error ?? 'Login failed')
      : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <ThemeToggle className="absolute right-4 top-4 h-8 w-8 p-0" />
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">IndiaPost CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-8"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-8"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {apiError && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {apiError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
