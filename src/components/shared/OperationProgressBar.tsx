type Variant = 'import' | 'sync';

const VARIANT_STYLES: Record<
  Variant,
  { track: string; fill: string }
> = {
  import: { track: 'bg-amber-200', fill: 'bg-amber-500' },
  sync: { track: 'bg-blue-200', fill: 'bg-blue-500' },
};

interface OperationProgressBarProps {
  variant: Variant;
  percent: number;
  label: string;
  className?: string;
}

export function OperationProgressBar({
  variant,
  percent,
  label,
  className = 'max-w-[140px]',
}: OperationProgressBarProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="space-y-1">
      <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${styles.track} ${className}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${styles.fill}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
