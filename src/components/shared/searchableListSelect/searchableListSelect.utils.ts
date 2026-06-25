import { SEARCHABLE_LIST_MENU_SELECTOR } from './searchableListSelect.constants';

export function isSearchableListMenuTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(SEARCHABLE_LIST_MENU_SELECTOR))
  );
}

/** Call from DialogContent onInteractOutside / onPointerDownOutside handlers. */
export function preventDialogCloseForSearchableListMenu(event: {
  preventDefault: () => void;
  target: EventTarget | null;
}) {
  if (isSearchableListMenuTarget(event.target)) {
    event.preventDefault();
  }
}

export function selectSearchableListOption(
  listId: string,
  anchorRef: React.RefObject<HTMLElement | null>,
  onChange: (listId: string) => void,
  onClose: () => void,
) {
  onChange(listId);
  const trigger = anchorRef.current?.querySelector('button');
  if (trigger instanceof HTMLButtonElement) {
    trigger.focus();
  }
  requestAnimationFrame(() => onClose());
}
