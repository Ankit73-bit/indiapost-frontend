interface UsersTableHeaderProps {
  columns: readonly string[];
}

export function UsersTableHeader({ columns }: UsersTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        {columns.map((column, index) => (
          <th
            key={column}
            className={`px-4 py-2.5 font-medium text-muted-foreground ${
              index === columns.length - 1 ? 'text-right' : 'text-left'
            }`}
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export const USERS_TABLE_COLUMNS = [
  'User',
  'Role',
  'Client',
  'Status',
  'Created',
  'Actions',
] as const;
