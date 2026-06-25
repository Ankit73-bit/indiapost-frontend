import type { ElementType } from 'react';

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  sub?: string;
  onClick?: () => void;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  sub,
  onClick,
}: DashboardStatCardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 ${onClick ? 'cursor-pointer hover:bg-muted/20 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="rounded-md bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
