import { Loader2 } from 'lucide-react';

interface ArticlesTableHeaderProps {
  extraCols: number;
  hasLoanAccount: boolean;
  hasCustomerId: boolean;
  headerCheckboxChecked: boolean;
  selectingAllSyncable: boolean;
  nonTerminalOnly: boolean;
  listNonTerminalCount: number;
  syncableOnPageCount: number;
  isListSyncing: boolean;
  onToggleAllSyncable: () => void | Promise<void>;
}

export function ArticlesTableHeader({
  extraCols: _extraCols,
  hasLoanAccount,
  hasCustomerId,
  headerCheckboxChecked,
  selectingAllSyncable,
  nonTerminalOnly,
  listNonTerminalCount,
  syncableOnPageCount,
  isListSyncing,
  onToggleAllSyncable,
}: ArticlesTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="w-10 px-3 py-2.5">
          {selectingAllSyncable ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-border"
              checked={headerCheckboxChecked}
              onChange={() => void onToggleAllSyncable()}
              disabled={
                (nonTerminalOnly
                  ? listNonTerminalCount === 0
                  : syncableOnPageCount === 0) || isListSyncing
              }
              aria-label={
                nonTerminalOnly
                  ? 'Select all syncable non-terminal articles in this list'
                  : 'Select all syncable articles on this page'
              }
            />
          )}
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
          Article #
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Recipient
        </th>
        {hasLoanAccount && (
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
            Loan A/C
          </th>
        )}
        {hasCustomerId && (
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
            Customer ID
          </th>
        )}
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Status
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Latest Event
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">
          Last Synced
        </th>
        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
          Tries
        </th>
      </tr>
    </thead>
  );
}
