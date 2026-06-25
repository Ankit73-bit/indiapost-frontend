import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LoginForm } from '@/components/login/LoginForm';
import { LoginHeader } from '@/components/login/LoginHeader';
import { useLoginPage } from '@/pages/login/useLoginPage';

export function LoginPage() {
  const { form, isLoading, apiError, onSubmit } = useLoginPage();

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-y-auto bg-muted/30 px-4 py-8">
      <ThemeToggle className="absolute right-4 top-4 h-8 w-8 p-0" />
      <div className="w-full max-w-sm">
        <LoginHeader />
        <LoginForm
          form={form}
          isLoading={isLoading}
          apiError={apiError}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
