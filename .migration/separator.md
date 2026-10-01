# separator

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/separator.tsx`: `radix-ui` Separator -> callable `@base-ui/react/separator`. Dropped `decorative` prop. Classes use `data-horizontal` / `data-vertical`.
- Leftover scan clean.

## Left alone

n/a

## Behavior changes

- `decorative` removed (call sites did not pass it).

## Verify by hand

- Header vertical separator between GitHub and theme toggle.
- Docs copy-page vertical rule.
