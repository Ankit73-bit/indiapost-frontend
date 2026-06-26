import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SampleExcelValidationResult } from '@/types';

export function SampleExcelValidationReport({
  validation,
}: {
  validation: SampleExcelValidationResult | null;
}) {
  if (!validation) return null;

  return (
    <Card
      className={
        validation.isValid
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-amber-500/30 bg-amber-500/5'
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
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
      <CardContent className="space-y-4 text-sm">
        {validation.isValid ? (
          <p className="text-muted-foreground">
            All required columns are present ({validation.rowCount} data row
            {validation.rowCount !== 1 ? 's' : ''}). Table and list fields may use a row
            suffix (_1, _2, …) in Excel headers. You can save the sample Excel and
            generate a test PDF.
          </p>
        ) : (
          <>
            {(validation.tooManyRows || validation.noDataRows) && (
              <div>
                <p className="mb-2 font-medium">Row count</p>
                {validation.tooManyRows ? (
                  <p className="text-muted-foreground">
                    Sample Excel has {validation.rowCount} data rows. Maximum allowed is{' '}
                    {validation.maxRows}.
                  </p>
                ) : null}
                {validation.noDataRows ? (
                  <p className="text-muted-foreground">
                    Sample Excel has no data rows below the header row.
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <p className="mb-2 font-medium">Missing columns</p>
              {validation.missingColumns.length ? (
                <div className="flex flex-wrap gap-2">
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
                <div className="overflow-x-auto rounded-md border border-border">
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
