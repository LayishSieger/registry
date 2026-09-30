# dropdown-menu

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/dropdown-menu.tsx`: `DropdownMenu` -> `@base-ui/react/menu`; Content uses Positioner; Label -> GroupLabel; ItemIndicator -> Checkbox/Radio indicators; Sub -> SubmenuRoot; CSS vars `--available-height` / `--transform-origin`; data-open/data-closed.
- `components/docs-copy-page.tsx`: Trigger `render={<Button/>}`; `onSelect` -> `onClick`; open chevron uses `group-data-open` / `group-data-popup-open`.
- Leftover scan clean.

## Left alone

Unused submenu/checkbox/radio exports kept for API parity.

## Behavior changes

None observed for simple items (close-on-click default for Item).

## Verify by hand

- Docs Copy page dropdown: Copy markdown + Agent prompt.
