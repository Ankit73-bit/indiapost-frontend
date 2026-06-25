import { NoContextState } from '@/components/articles/NoContextState';
import { ListPicker } from '@/components/articles/ListPicker';
import { ArticlesListView } from '@/components/articles/ArticlesListView';
import { useArticlesPage } from '@/hooks/useArticlesPage';

export function ArticlesPage() {
  const { clientId, listId, isAdmin } = useArticlesPage();

  if (!clientId) {
    return (
      <div className="space-y-5">
        <NoContextState isAdmin={isAdmin} />
      </div>
    );
  }

  if (!listId) {
    return (
      <div className="space-y-5">
        <ListPicker clientId={clientId} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ArticlesListView
        key={`${clientId}-${listId}`}
        clientId={clientId}
        listId={listId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
