import { Mail } from 'lucide-react';

export function LoginHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mb-3 flex justify-center">
        <Mail className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-semibold">IndiaPost CRM</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to your account
      </p>
    </div>
  );
}
