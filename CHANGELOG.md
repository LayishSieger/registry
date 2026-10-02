# registry

## 0.2.1

### Patch Changes

- [#21](https://github.com/LayishSieger/registry/pull/21) [`2008400`](https://github.com/LayishSieger/registry/commit/20084003c3c10e6f0e61e742dc186b3a1908e68f) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Ask: host-owned async `onSubmit(AskResult)`; remove built-in sonner / `toastOnSubmit`.
  
  Breaking for consumers who re-run `shadcn add` (overwrites local copies): `onSubmit` now receives `AskResult` (sync or Promise) instead of a form event; `toastOnSubmit` and the `sonner` registry dependency are removed. Toast and post-submit UI belong in the host (docs previews call `toast` from `onSubmit`).

## 0.2.0

### Minor Changes

- [#5](https://github.com/LayishSieger/registry/pull/5) [`0a19c96`](https://github.com/LayishSieger/registry/commit/0a19c96115964bc1c79279f98b590698e19fcdc5) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Ask: interactive focus, hold-⌘/Ctrl inline Kbd hints, plain variant, choice descriptions, and sonner submit toasts.
  
  Adds `focusable` / `focusPriority` / `focusTriggers` / `shortcutHints` / `variant` / `toastOnSubmit`, plus `InteractiveFocusProvider` and `InteractiveFocusSurface` exports.

- [#1](https://github.com/LayishSieger/registry/pull/1) [`a8d1a58`](https://github.com/LayishSieger/registry/commit/a8d1a58de82bddc0a8af96e6acc42bcebf714ead) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Composer: prompt shell on input-group with mode, mic, and attach slots for AI SDK useChat.
  
  Adds the `composer` registry block with Enter/Shift+Enter send behavior, Mod shortcuts and tooltips, `status`-driven send/stop, and host-owned slots (`modeSlot`, `micSlot`, `attachSlot`).

### Patch Changes

- [#17](https://github.com/LayishSieger/registry/pull/17) [`38e3e13`](https://github.com/LayishSieger/registry/commit/38e3e13232dae42725091edf97a813c08c903478) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Point the registry homepage at the canonical docs host `https://ui.layishsieger.com`.
