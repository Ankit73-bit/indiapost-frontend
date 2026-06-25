import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import type { NoContextStateProps } from '@/pages/articles/articlesPage.types';

export function NoContextState({ isAdmin }: NoContextStateProps) {
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 text-center px-6">
      <div className="rounded-full bg-muted p-4">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">No list selected</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isAdmin
            ? 'Choose a list from the Lists page, or pick one below after selecting a client.'
            : 'Select a list from the Lists page to view its articles.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/lists"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go to Lists <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {isAdmin && (
          <Link
            to="/clients"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/40 transition-colors"
          >
            Go to Clients
          </Link>
        )}
      </div>
    </div>
  );
}
