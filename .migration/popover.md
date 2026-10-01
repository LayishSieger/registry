# popover

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/popover.tsx`: Portal > Positioner > Popup; positioning props forwarded to Positioner; Title/Description use Base primitives; CSS var `--transform-origin`.
- `PopoverAnchor`: inert passthrough (no Base Anchor part). Prefer `anchor` on `PopoverContent`.
- `components/mobile-nav.tsx`: frosted full-bleed menu now anchors via `ref` + `PopoverContent anchor`; height uses `--available-height`.
- `registry/.../ask/ask.tsx` cancel: `PopoverTrigger render={<Button/>}`.
- Leftover scan clean (optional `asChild?` only on inert Anchor type).

## Left alone

sonner; Ask host `onSubmit` (no toast in Ask).

## Behavior changes

- Popover Anchor dropped as a real part; mobile nav uses Positioner `anchor` instead.

## Verify by hand

- Mobile menu (hamburger + L mark) opens frosted overlay under header; links close it.
- Ask cancel popover opens from X and confirms/cancels.
