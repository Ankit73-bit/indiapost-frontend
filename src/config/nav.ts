import type { LucideIcon } from 'lucide-react';
import {
  Route,
  ScrollText,
  UserCog,
  Users,
} from 'lucide-react';

export interface NavAccess {
  adminOnly?: boolean;
  customerHide?: boolean;
}

export interface NavLeaf extends NavAccess {
  to: string;
  label: string;
  end?: boolean;
}

export interface NavLinkItem extends NavLeaf {
  kind: 'link';
  icon: LucideIcon;
}

export interface NavGroupItem extends NavAccess {
  kind: 'group';
  label: string;
  icon: LucideIcon;
  children: NavLeaf[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export const NAV_ITEMS: NavItem[] = [
  {
    kind: 'link',
    to: '/clients',
    label: 'Clients',
    icon: Users,
    adminOnly: true,
  },
  {
    kind: 'group',
    label: 'Tracking',
    icon: Route,
    children: [
      { to: '/lists', label: 'Lists' },
      { to: '/articles', label: 'Articles' },
      { to: '/sync', label: 'Sync', adminOnly: true, customerHide: true },
    ],
  },
  {
    kind: 'group',
    label: 'Notice Generator',
    icon: ScrollText,
    children: [
      { to: '/notice-generator/templates', label: 'Template' },
      { to: '/notice-generator/config', label: 'Config' },
      { to: '/notice-generator/excel', label: 'Excel' },
      { to: '/notice-generator/generator', label: 'Generator' },
    ],
  },
  {
    kind: 'link',
    to: '/users',
    label: 'Users',
    icon: UserCog,
    adminOnly: true,
  },
];

export function isNavLeafVisible(item: NavAccess, isAdmin: boolean): boolean {
  if (item.adminOnly && !isAdmin) return false;
  if (item.customerHide && !isAdmin) return false;
  return true;
}

export function filterNavItems(items: NavItem[], isAdmin: boolean): NavItem[] {
  return items
    .filter((item) => isNavLeafVisible(item, isAdmin))
    .map((item) => {
      if (item.kind === 'link') return item;
      const children = item.children.filter((child) =>
        isNavLeafVisible(child, isAdmin),
      );
      if (children.length === 0) return null;
      return { ...item, children };
    })
    .filter((item): item is NavItem => item !== null);
}
