interface ListPdfsDialogSummaryProps {
  totalArticles: number;
}

export function ListPdfsDialogSummary({ totalArticles }: ListPdfsDialogSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Articles
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">
        {totalArticles.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Each PDF is built when you view or download — always up to date.
      </p>
    </div>
  );
}
