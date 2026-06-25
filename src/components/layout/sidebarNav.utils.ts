import type { NavLeaf } from '@/config/nav';

export function isPathActive(pathname: string, to: string, end?: boolean): boolean {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function isGroupActive(pathname: string, children: NavLeaf[]): boolean {
  return children.some((child) => isPathActive(pathname, child.to, child.end));
}
