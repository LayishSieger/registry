# project

2026-09-30, whole-project Base UI migration (legacy `new-york` style)

## Strategy

Legacy `new-york` has no `base-new-york` counterpart. Used the **transformation engine** on existing wrappers (kept classes), not CLI overwrite / base-nova restyle.

## Dependency swap

- Added `@base-ui/react`.
- Removed `radix-ui`, `@radix-ui/react-slot`, `@radix-ui/react-label`.
- **Kept `sonner`** (preview-only toast via Ask host `onSubmit`).

## Migrated wrappers

button, badge, separator, tooltip, popover, dropdown-menu.

## Untouched (intentional)

card, input, input-group, textarea, kbd, spinner, questionnaire (`@shadcn/react`), sonner.

## Consumer sweep

asChild -> render; TooltipProvider delay; mobile nav anchor ref; docs menu onClick; Ask cancel + Composer tooltips.

## Registry

Regenerated `public/r/ask.json`, `public/r/composer.json`, `public/r/registry.json`.

## FLAG (per skill)

`components.json` still `"style": "new-york"`. Future `shadcn add` may deliver Radix variants until style is switched (e.g. to a `base-*` preset) or components are added manually from Base URLs.

## Build

`tsc --noEmit` and `next build` succeeded after migration.

## Follow-up fixes

- Link Buttons pass `nativeButton={false}`.
- Popover/Menu triggers that `render` a Base `Button` pass `nativeButton={false}`.
