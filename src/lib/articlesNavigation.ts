const STORAGE_KEY = 'indiapost_articles_context';
const RECENT_LISTS_KEY = 'indiapost_articles_recent_lists';

export const MAX_RECENT_ARTICLE_LISTS = 5;

export interface ArticlesNavigationContext {
  clientId: string;
  listId?: string;
  savedAt: number;
}

export interface RecentArticleList {
  clientId: string;
  listId: string;
  seenAt: number;
}

function loadRecentListsRaw(): RecentArticleList[] {
  try {
    const raw = localStorage.getItem(RECENT_LISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentArticleList[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e?.clientId && e?.listId && typeof e.seenAt === 'number',
    );
  } catch {
    return [];
  }
}

export function recordRecentArticleList(
  clientId: string,
  listId: string,
): void {
  try {
    const all = loadRecentListsRaw().filter(
      (e) => !(e.clientId === clientId && e.listId === listId),
    );
    all.unshift({ clientId, listId, seenAt: Date.now() });
    localStorage.setItem(RECENT_LISTS_KEY, JSON.stringify(all.slice(0, 100)));
  } catch {
    // ignore quota / private mode
  }
}

export function getRecentArticleListIds(clientId: string): string[] {
  return loadRecentListsRaw()
    .filter((e) => e.clientId === clientId)
    .sort((a, b) => b.seenAt - a.seenAt)
    .slice(0, MAX_RECENT_ARTICLE_LISTS)
    .map((e) => e.listId);
}

export function saveArticlesContext(clientId: string, listId?: string): void {
  try {
    const payload: ArticlesNavigationContext = {
      clientId,
      listId,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    if (listId) recordRecentArticleList(clientId, listId);
  } catch {
    // ignore quota / private mode
  }
}

export function loadArticlesContext(): ArticlesNavigationContext | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArticlesNavigationContext;
    if (!parsed?.clientId) return null;
    return parsed;
  } catch {
    return null;
  }
}
