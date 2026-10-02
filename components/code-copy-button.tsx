"use client"

import { CheckIcon, CopyIcon } from "lucide-react"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Shared ghost copy control — subtle background on hover. */
export const copyButtonClassName =
  "size-7 shrink-0 text-muted-foreground hover:bg-foreground/8 hover:text-foreground dark:hover:bg-foreground/12"

export function CodeCopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string
  className?: string
  label?: string
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(copyButtonClassName, className)}
      onClick={() => copyToClipboard(value)}
      aria-label={isCopied ? "Copied" : label}
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
