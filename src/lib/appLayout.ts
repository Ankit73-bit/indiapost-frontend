/** Routes that use the full main content width (no max-w-7xl). */
export function isFullWidthAppRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/notice-generator') ||
    pathname.startsWith('/lists') ||
    pathname.startsWith('/articles') ||
    pathname.startsWith('/sync')
  );
}

/** Immersive editor routes — no page padding, fixed viewport height. */
export function isImmersiveEditorRoute(pathname: string): boolean {
  return /\/notice-generator\/templates\/[^/]+\/editor/.test(pathname);
}
