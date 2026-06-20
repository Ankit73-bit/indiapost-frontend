import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { VariableValidationResult } from '@/types';
import { cn } from '@/lib/utils';

export function NoticeVariableValidationPanel({
  validation,
}: {
  validation?: VariableValidationResult | null;
}) {
  if (!validation) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Upload .typ files to run variable validation against the notice config.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        validation.isValid
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-amber-500/30 bg-amber-500/5',
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {validation.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          Variable validation
          <Badge variant={validation.isValid ? 'default' : 'secondary'}>
            {validation.isValid ? 'Pass' : 'Review needed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ValidationSection
          title="Detected in template"
          items={validation.detected}
          empty="No variables detected yet"
        />
        <ValidationSection
          title="Missing in config"
          items={validation.missingInConfig}
          variant="warning"
          empty="All detected variables are covered by config"
        />
        <ValidationSection
          title="Configured but not in template"
          items={validation.unusedInConfig}
          variant="muted"
          empty="All configured fields appear in template"
        />
      </CardContent>
    </Card>
  );
}

function ValidationSection({
  title,
  items,
  variant = 'default',
  empty,
}: {
  title: string;
  items: string[];
  variant?: 'default' | 'warning' | 'muted';
  empty: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className={cn(
                'rounded-full px-2 py-0.5 font-mono text-xs',
                variant === 'warning' && 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
                variant === 'muted' && 'bg-muted text-muted-foreground',
                variant === 'default' && 'bg-background ring-1 ring-border',
              )}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
