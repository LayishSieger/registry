"use client"

import {
  ComposerShortcutKbd,
} from "@/registry/new-york/blocks/composer/composer"
import { useModKey } from "@/hooks/use-mod-key"
import { cn } from "@/lib/utils"

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
      className={cn(className)}
    />
  )
}

export function useShortcutLabel(shortcut: string) {
  const modKey = useModKey()
  return shortcut
    .split("+")
    .map((part) => (part === "Mod" ? modKey : part))
    .join("+")
}
