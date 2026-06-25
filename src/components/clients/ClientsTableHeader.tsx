export function ClientsTableHeader() {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Name
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Slug
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Status
        </th>
        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
          Created
        </th>
        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
          Actions
        </th>
      </tr>
    </thead>
  );
}
