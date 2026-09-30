---
"registry": patch
---

Ask: host-owned async `onSubmit(AskResult)`; remove built-in sonner / `toastOnSubmit`.

Breaking for consumers who re-run `shadcn add` (overwrites local copies): `onSubmit` now receives `AskResult` (sync or Promise) instead of a form event; `toastOnSubmit` and the `sonner` registry dependency are removed. Toast and post-submit UI belong in the host (docs previews call `toast` from `onSubmit`).
