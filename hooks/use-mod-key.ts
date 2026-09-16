"use client"

import * as React from "react"

function readModKey(): "⌘" | "Ctrl" {
  const apple =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
    /Mac OS|Macintosh/.test(navigator.userAgent)
  return apple ? "⌘" : "Ctrl"
}

/** ⌘ on Apple platforms, Ctrl elsewhere. */
export function useModKey() {
  return React.useSyncExternalStore(
    () => () => {},
    readModKey,
    () => "Ctrl" as const,
  )
}

/** Turn `Mod+Shift+A` into display parts with a real modifier key. */
export function shortcutParts(shortcut: string, modKey: string) {
  return shortcut.split("+").map((part) => (part === "Mod" ? modKey : part))
}

/** Plain-text shortcut for `title` / aria (never "Mod" or "COMMAND"). */
export function formatShortcutLabel(shortcut: string, modKey: string) {
  return shortcutParts(shortcut, modKey).join("+")
}
