import { Phone, Mail, MapPin } from 'lucide-react';
import {
  DetailSection,
  RecipientLine,
} from '@/components/articles/ArticleDetailSection';
import {
  articleHasAddress,
  recipientHasContactDetails,
} from '@/components/articles/articleSheet/articleSheet.utils';
import type { Article } from '@/types';

interface ArticleSheetRecipientSectionProps {
  article: Article;
}

export function ArticleSheetRecipientSection({ article }: ArticleSheetRecipientSectionProps) {
  const { recipient } = article;
  const hasAddress = articleHasAddress(article);

  return (
    <DetailSection title="Recipient">
      <p className="border-b border-border/50 px-3 py-2.5 text-sm font-medium">
        {recipient.name}
      </p>
      {recipient.mobile && (
        <RecipientLine icon={Phone}>{recipient.mobile}</RecipientLine>
      )}
      {recipient.email && (
        <RecipientLine icon={Mail}>{recipient.email}</RecipientLine>
      )}
      {hasAddress ? (
        <RecipientLine icon={MapPin}>
          <span className="block space-y-0.5">
            {recipient.addressLine1 && (
              <span className="block">{recipient.addressLine1}</span>
            )}
            {recipient.addressLine2 && (
              <span className="block">{recipient.addressLine2}</span>
            )}
            {(recipient.city ||
              recipient.state ||
              recipient.pincode) && (
              <span className="block">
                {[recipient.city, recipient.state, recipient.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            )}
          </span>
        </RecipientLine>
      ) : (
        !recipientHasContactDetails(article) && (
          <p className="px-3 py-2.5 text-sm text-muted-foreground">
            No contact details on file.
          </p>
        )
      )}
    </DetailSection>
  );
}
