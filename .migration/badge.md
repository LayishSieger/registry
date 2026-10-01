# badge

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/badge.tsx`: `Slot`/`asChild` -> `useRender` + `mergeProps` from `@base-ui/react`. Kept existing badge classes.
- Leftover scan clean.

## Left alone

No badge call sites used `asChild`.

## Behavior changes

None.

## Verify by hand

- Any badge rendering still looks the same (rounded-full variants).
