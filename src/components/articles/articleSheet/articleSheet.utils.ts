import type { Article } from '@/types';

export function getArticleAttributeEntries(
  article: Article,
): [string, string][] {
  return Object.entries(article.attributes ?? {});
}

export function articleHasAddress(article: Article): boolean {
  const { recipient } = article;
  return Boolean(
    recipient.addressLine1 ||
      recipient.addressLine2 ||
      recipient.city ||
      recipient.state ||
      recipient.pincode,
  );
}

export function articleHasBookingDetails(article: Article): boolean {
  const { bookingDetails } = article;
  return Boolean(
    bookingDetails?.articleType ||
      bookingDetails?.originPincode ||
      bookingDetails?.destinationPincode ||
      bookingDetails?.tariff !== undefined ||
      article.deliveredAt,
  );
}

export function recipientHasContactDetails(article: Article): boolean {
  const { recipient } = article;
  return Boolean(recipient.mobile || recipient.email);
}
