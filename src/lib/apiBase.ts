/** API origin for fetch calls outside RTK Query. Empty string = same-origin /api (Vite proxy). */
export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
}
