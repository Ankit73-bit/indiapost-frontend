import { Mail, ShieldAlert } from 'lucide-react';
import type { ProfileInfoStripProps } from '@/pages/profile/profilePage.types';

export function ProfileInfoStrip({ email, role, clientName }: ProfileInfoStripProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Mail className="h-3.5 w-3.5 shrink-0" />
        <span className="font-mono">{email}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
        <span className="capitalize">{role}</span>
        {clientName && (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{clientName}</span>
        )}
      </div>
    </div>
  );
}
