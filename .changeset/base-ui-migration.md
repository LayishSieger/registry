---
"registry": minor
---

Migrate site UI wrappers and Ask/Composer call sites from Radix to Base UI (`@base-ui/react`).

Breaking for consumers who re-run `shadcn add` (overwrites local copies): Button/Badge drop `asChild` for Base `render`; Popover/Tooltip use Positioner; TooltipProvider `delayDuration` → `delay`; DropdownMenu is Menu-based. Ask cancel + Composer shortcut tooltips updated accordingly. Sonner stays preview-only — Ask submit remains host `onSubmit`.
