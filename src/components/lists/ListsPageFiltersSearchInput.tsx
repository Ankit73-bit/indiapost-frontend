import { Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ListsPageFiltersSearchInputProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  isFetching: boolean;
  isLoading: boolean;
  onClearSearch: () => void;
}

export function ListsPageFiltersSearchInput({
  searchInput,
  onSearchInputChange,
  isFetching,
  isLoading,
  onClearSearch,
}: ListsPageFiltersSearchInputProps) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by list name, client…"
        className="pl-8 pr-8"
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
      />
      {searchInput && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onClearSearch}
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {isFetching && !isLoading && !searchInput && (
        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
