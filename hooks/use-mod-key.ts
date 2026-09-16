"use client"

import * as React from "react"

/** ⌘ on Apple platforms, Ctrl elsewhere. */
export function useModKey() {
  const [modKey, setModKey] = React.useState<"⌘" | "Ctrl">("Ctrl")

  React.useEffect(() => {
    const apple =
      /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
      /Mac OS|Macintosh/.test(navigator.userAgent)
    setModKey(apple ? "⌘" : "Ctrl")
  }, [])

  return modKey
}

/** Turn `Mod+Shift+A` into display parts with a real modifier key. */
export function shortcutParts(shortcut: string, modKey: string) {
  return shortcut.split("+").map((part) => (part === "Mod" ? modKey : part))
}

/** Plain-text shortcut for `title` / aria (never "Mod" or "COMMAND"). */
export function formatShortcutLabel(shortcut: string, modKey: string) {
  return shortcutParts(shortcut, modKey).join("+")
}
