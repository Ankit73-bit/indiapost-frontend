import type { ProfileCardProps } from '@/pages/profile/profilePage.types';

export function ProfileCard({ icon: Icon, title, children }: ProfileCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-muted p-1.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
