# button

2026-09-30, transformation engine (legacy new-york), migrated

## Changed

- `components/ui/button.tsx`: `Slot`/`asChild` -> `@base-ui/react/button` with native `render` prop. Kept existing `buttonVariants` classes.
- Consumers `asChild` -> `render={...}`: `app/page.tsx`, `components/site-header.tsx`, `components/github-link.tsx`, `components/open-in-v0-button.tsx`.
- Leftover scan clean: no `radix-ui` / `@radix-ui`.

## Left alone

- `sonner`, card/input/textarea/kbd/spinner/questionnaire (no radix Slot).

## Behavior changes

None flagged for button.

## Verify by hand

- Home/docs links that use `Button render={<Link/>}` navigate correctly.
- Open in v0 still opens external link.
