import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SampleExcelValidationResult } from '@/types';

export function SampleExcelValidationReport({
  validation,
  compact = false,
  context = 'sample',
}: {
  validation: SampleExcelValidationResult | null;
  compact?: boolean;
  context?: 'sample' | 'production';
}) {
  if (!validation) return null;

  const isProduction = context === 'production';

  return (
    <Card
      className={cn(
        validation.isValid
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-amber-500/30 bg-amber-500/5',
        compact && 'shadow-none',
      )}
    >
      <CardHeader className={cn('pb-2', compact && 'px-3 pt-3')}>
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
          {validation.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-600" />
          )}
          Validation report
          <Badge variant={validation.isValid ? 'default' : 'secondary'}>
            {validation.isValid ? 'Pass' : 'Review needed'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-4 text-sm', compact && 'px-3 pb-3')}>
        {validation.isValid ? (
          <p className="text-muted-foreground">
            All required columns are present ({validation.rowCount} data row
            {validation.rowCount !== 1 ? 's' : ''}).
            {isProduction
              ? ' You can save this Excel for PDF generation.'
              : ' Table and list fields may use a row suffix (_1, _2, …) in Excel headers. You can save the sample Excel and generate a test PDF.'}
          </p>
        ) : (
          <>
            {(validation.tooManyRows || validation.noDataRows) && (
              <div>
                <p className="mb-2 font-medium">Row count</p>
                {validation.tooManyRows ? (
                  <p className="text-muted-foreground">
                    {isProduction ? 'Excel' : 'Sample Excel'} has {validation.rowCount}{' '}
                    data rows.
                    {!isProduction && validation.maxRows > 0
                      ? ` Maximum allowed is ${validation.maxRows}.`
                      : null}
                  </p>
                ) : null}
                {validation.noDataRows ? (
                  <p className="text-muted-foreground">
                    {isProduction ? 'Excel' : 'Sample Excel'} has no data rows below the
                    header row.
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <p className="mb-2 font-medium">
                Missing columns
                {validation.missingColumns.length > 0 && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({validation.missingColumns.length})
                  </span>
                )}
              </p>
              {validation.missingColumns.length ? (
                <div
                  className={cn(
                    'flex flex-wrap gap-2',
                    compact && 'max-h-36 overflow-y-auto rounded-md border border-border/60 bg-background/50 p-2',
                  )}
                >
                  {validation.missingColumns.map((column) => (
                    <Badge key={column} variant="outline" className="font-mono text-xs">
                      {column}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No missing columns.</p>
              )}
            </div>

            <div>
              <p className="mb-2 font-medium">Incorrect naming</p>
              {validation.incorrectNaming.length ? (
                <div
                  className={cn(
                    'overflow-x-auto rounded-md border border-border',
                    compact && 'max-h-32 overflow-y-auto',
                  )}
                >
                  <table className="w-full min-w-[320px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Expected</th>
                        <th className="px-3 py-2 font-medium">Found</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validation.incorrectNaming.map((row) => (
                        <tr key={`${row.expected}-${row.found}`} className="border-b border-border/60">
                          <td className="px-3 py-2 font-mono">{row.expected}</td>
                          <td className="px-3 py-2 font-mono">{row.found}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No naming mismatches.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
