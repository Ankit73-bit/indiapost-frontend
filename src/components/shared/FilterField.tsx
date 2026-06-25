interface FilterFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

export function FilterField({ label, hint, children }: FilterFieldProps) {
  return (
    <div className="relative space-y-1.5 overflow-visible">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {hint}
      </div>
      {children}
    </div>
  );
}
