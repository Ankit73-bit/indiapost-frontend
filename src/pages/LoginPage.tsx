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
    <div className="relative flex min-h-full items-center justify-center overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
      <ThemeToggle className="absolute right-4 top-4 h-9 w-9 p-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors" />
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 ring-1 ring-primary/20">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            IndiaPost CRM
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Enterprise postal service management
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card shadow-xl shadow-black/5">
          <div className="px-7 py-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
                  {apiError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full mt-6 h-11 text-base font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Enterprise postal management system
        </p>
      </div>
    </div>
  );
}
