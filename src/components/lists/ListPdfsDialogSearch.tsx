import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ListPdfsDialogSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ListPdfsDialogSearch({ search, onSearchChange }: ListPdfsDialogSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search article number…"
        className="pl-8"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
