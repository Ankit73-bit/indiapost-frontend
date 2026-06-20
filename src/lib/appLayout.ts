/** Routes that use the full main content width (no max-w-7xl). */
export function isFullWidthAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/notice-generator') ||
    pathname.startsWith('/lists') ||
    pathname.startsWith('/articles') ||
    pathname.startsWith('/sync')
  );
}
