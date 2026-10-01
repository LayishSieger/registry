# tooltip

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/tooltip.tsx`: Portal > Positioner > Popup; Provider `delayDuration` -> `delay`; transform origin CSS var -> `--transform-origin`.
- `registry/.../composer/composer.tsx` + `components/composer-preview.tsx`: `asChild` -> `render`; removed `disableHoverableContent`; `delayDuration={200}` -> `delay={200}`.
- Leftover scan clean.

## Left alone

sonner

## Behavior changes

- `disableHoverableContent` has no Base UI equivalent — removed; hoverable tooltip content may behave differently (FLAG).

## Verify by hand

- Composer attach/mode/mic/send shortcut tooltips appear on hover and dismiss on click.
