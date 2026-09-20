"use client"

import { ComposerShortcutKbd } from "@/registry/new-york/blocks/composer/composer"
import {
  formatShortcutLabel,
  useModKey,
} from "@/hooks/use-mod-key"

export function ShortcutKbd({
  shortcut,
  className,
}: {
  /** e.g. `Mod+Shift+A` or `Enter` */
  shortcut: string
  className?: string
}) {
  const modKey = useModKey()

  return (
    <ComposerShortcutKbd
      shortcut={shortcut}
      modKey={modKey}
      className={className}
    />
  )
}

export function useShortcutLabel(shortcut: string) {
  const modKey = useModKey()
  return formatShortcutLabel(shortcut, modKey)
}
