/** Shared fetch defaults for cookie-based auth (HttpOnly session cookies). */
export const FETCH_CREDENTIALS: RequestCredentials = 'include';

export function credFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, { ...init, credentials: FETCH_CREDENTIALS });
}
