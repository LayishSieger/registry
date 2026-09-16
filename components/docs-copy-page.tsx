"use client"

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  SparklesIcon,
} from "lucide-react"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { absoluteUrl } from "@/lib/site"

export function DocsCopyPage({
  markdown,
  path,
}: {
  markdown: string
  path: string
}) {
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  function pageUrl() {
    // Prefer the live origin when copying in the browser (preview/prod/local).
    // Fall back to the configured site base for SSR/non-window contexts.
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`
    }
    return absoluteUrl(path)
  }

  function agentPrompt() {
    return `I'm looking at this documentation: ${pageUrl()}

Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`
  }

  function copyPrompt() {
    return copyToClipboard(agentPrompt())
  }

  return (
    <div className="relative flex w-fit items-stretch rounded-lg bg-secondary">
      <Button
        variant="secondary"
        size="icon-sm"
        className="size-8 px-2 shadow-none md:size-7"
        onClick={() => copyToClipboard(markdown)}
        aria-label={isCopied ? "Copied page" : "Copy page"}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </Button>
      <Separator
        orientation="vertical"
        className="absolute top-1.5 right-8 z-10 h-5! bg-foreground/10 md:right-7"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon-sm"
            className="group size-8 px-2 shadow-none md:size-7"
            aria-label="Copy page options"
          >
            <ChevronDownIcon className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => copyToClipboard(markdown)}>
              <CopyIcon />
              Copy
              <span className="ms-auto text-xs text-muted-foreground">Markdown</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => copyPrompt()}>
              <SparklesIcon />
              Agent
              <span className="ms-auto text-xs text-muted-foreground">Prompt</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
