# registry

## 0.2.0

### Minor Changes

- [#5](https://github.com/LayishSieger/registry/pull/5) [`0a19c96`](https://github.com/LayishSieger/registry/commit/0a19c96115964bc1c79279f98b590698e19fcdc5) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Ask: interactive focus, hold-⌘/Ctrl inline Kbd hints, plain variant, choice descriptions, and sonner submit toasts.
  
  Adds `focusable` / `focusPriority` / `focusTriggers` / `shortcutHints` / `variant` / `toastOnSubmit`, plus `InteractiveFocusProvider` and `InteractiveFocusSurface` exports.

- [#1](https://github.com/LayishSieger/registry/pull/1) [`a8d1a58`](https://github.com/LayishSieger/registry/commit/a8d1a58de82bddc0a8af96e6acc42bcebf714ead) Thanks [@LayishSieger](https://github.com/LayishSieger)! - Composer: prompt shell on input-group with mode, mic, and attach slots for AI SDK useChat.
  
  Adds the `composer` registry block with Enter/Shift+Enter send behavior, Mod shortcuts and tooltips, `status`-driven send/stop, and host-owned slots (`modeSlot`, `micSlot`, `attachSlot`).
