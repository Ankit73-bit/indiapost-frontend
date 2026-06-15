import { SidebarContent } from '@/components/layout/SidebarContent';

export function Sidebar() {
  return (
    <aside className="hidden h-full min-h-0 w-56 shrink-0 flex-col border-r border-sidebar-border lg:flex">
      <SidebarContent />
    </aside>
  );
}
