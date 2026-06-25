function friendlyMongoDuplicateError(message: string): string | null {
  if (!message.includes('E11000')) return null;

  const slugMatch = message.match(/slug:\s*"([^"]+)"/);
  if (slugMatch) {
    return `Slug "${slugMatch[1]}" is already in use. Please choose a different slug.`;
  }

  return 'A record with these details already exists.';
}

/** Extract a user-facing message from an RTK Query / fetch error. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (!error || typeof error !== 'object') return fallback;

  const payload = error as { data?: { error?: string }; message?: string };
  const raw = payload.data?.error ?? payload.message;
  if (!raw) return fallback;

  return friendlyMongoDuplicateError(raw) ?? raw;
}
