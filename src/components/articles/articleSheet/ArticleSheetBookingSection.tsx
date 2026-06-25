import { DetailSection, DetailRow } from '@/components/articles/ArticleDetailSection';
import { articleHasBookingDetails } from '@/components/articles/articleSheet/articleSheet.utils';
import { formatDateTime } from '@/lib/helpers';
import type { Article } from '@/types';

interface ArticleSheetBookingSectionProps {
  article: Article;
}

export function ArticleSheetBookingSection({ article }: ArticleSheetBookingSectionProps) {
  const { bookingDetails } = article;

  if (!articleHasBookingDetails(article)) {
    return null;
  }

  return (
    <DetailSection title="Booking">
      {bookingDetails?.articleType && (
        <DetailRow label="Type" value={bookingDetails.articleType} />
      )}
      {bookingDetails?.originPincode && (
        <DetailRow
          label="Origin PIN"
          value={bookingDetails.originPincode}
          mono
        />
      )}
      {bookingDetails?.destinationPincode && (
        <DetailRow
          label="Destination PIN"
          value={bookingDetails.destinationPincode}
          mono
        />
      )}
      {bookingDetails?.tariff !== undefined && (
        <DetailRow label="Tariff" value={`₹${bookingDetails.tariff}`} />
      )}
      {article.deliveredAt && (
        <DetailRow
          label="Delivered at"
          value={formatDateTime(article.deliveredAt)}
        />
      )}
    </DetailSection>
  );
}
