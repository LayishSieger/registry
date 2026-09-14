"use client"

import { CheckIcon, CopyIcon } from "lucide-react"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto rounded-lg border bg-muted/50 px-3 py-2 font-mono text-sm",
        className,
      )}
    >
      <pre className="min-w-0 flex-1 overflow-x-auto">
        <code>{command}</code>
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 shrink-0"
        onClick={() => copyToClipboard(command)}
        aria-label="Copy command"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  )
}
