"use client"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  formatShortcutLabel,
  shortcutParts,
  useModKey,
} from "@/hooks/use-mod-key"
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
  const parts = shortcutParts(shortcut, modKey)

  return (
    <KbdGroup className={cn("align-middle", className)}>
      {parts.map((part, index) => (
        <Kbd key={`${shortcut}-${index}-${part}`}>{part}</Kbd>
      ))}
    </KbdGroup>
  )
}

export function useShortcutLabel(shortcut: string) {
  const modKey = useModKey()
  return formatShortcutLabel(shortcut, modKey)
}
