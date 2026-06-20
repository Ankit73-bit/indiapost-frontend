import { SEARCHABLE_LIST_MENU_SELECTOR } from '@/components/shared/SearchableListSelect';

/** Marker for portaled searchable dropdown menus (client, notice type). */
export const SEARCHABLE_SELECT_MENU_SELECTOR = '[data-searchable-select-menu]';

export { SEARCHABLE_LIST_MENU_SELECTOR };

export function isSearchableSelectMenuTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(SEARCHABLE_SELECT_MENU_SELECTOR) ||
        target.closest(SEARCHABLE_LIST_MENU_SELECTOR),
    )
  );
}
