import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ArticlesFilterSearchInputProps {
  searchPlaceholder: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isFetching: boolean;
  isLoading: boolean;
}

export function ArticlesFilterSearchInput({
  searchPlaceholder,
  searchInput,
  onSearchInputChange,
  isFetching,
  isLoading,
}: ArticlesFilterSearchInputProps) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={searchPlaceholder}
        className="pl-8"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        aria-label={searchPlaceholder}
      />
      {isFetching && !isLoading && (
        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
