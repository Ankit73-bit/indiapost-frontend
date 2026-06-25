import type { Article } from '@/types';

export function buildSearchPlaceholder(
  hasLoanAccount: boolean,
  hasCustomerId: boolean,
): string {
  const fields = ['article number', 'recipient'];
  if (hasLoanAccount) fields.push('loan A/C');
  if (hasCustomerId) fields.push('customer ID');
  const last = fields.pop()!;
  return fields.length > 0
    ? `Search ${fields.join(', ')} or ${last}…`
    : `Search ${last}…`;
}

export function isArticleSyncSelectable(article: Article): boolean {
  return !article.isTerminal && !article.indiaPostTrackingExpired;
}
