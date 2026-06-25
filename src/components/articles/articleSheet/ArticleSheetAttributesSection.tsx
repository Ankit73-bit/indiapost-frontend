import { DetailSection, DetailRow } from '@/components/articles/ArticleDetailSection';
import { getArticleAttributeEntries } from '@/components/articles/articleSheet/articleSheet.utils';
import type { Article } from '@/types';

interface ArticleSheetAttributesSectionProps {
  article: Article;
}

export function ArticleSheetAttributesSection({
  article,
}: ArticleSheetAttributesSectionProps) {
  const attributeEntries = getArticleAttributeEntries(article);

  if (attributeEntries.length === 0) {
    return null;
  }

  return (
    <DetailSection title="Attributes">
      {attributeEntries.map(([key, value]) => (
        <DetailRow
          key={key}
          label={key.replace(/_/g, ' ')}
          value={value}
          mono
        />
      ))}
    </DetailSection>
  );
}
