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
    <div className="group/buttons relative flex items-stretch rounded-lg bg-secondary *:[[data-slot=button]]:focus-visible:relative *:[[data-slot=button]]:focus-visible:z-10">
      <Button
        variant="secondary"
        size="sm"
        className="h-8 gap-1.5 px-2.5 shadow-none md:h-7 md:text-[0.8rem]"
        onClick={() => copyToClipboard(markdown)}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        Copy Page
      </Button>
      <Separator
        orientation="vertical"
        className="absolute top-1.5 right-8 z-0 h-5! bg-foreground/10 md:right-7"
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="peer size-8 shadow-none md:size-7"
              aria-label="Copy page options"
            />
          }
        >
          <ChevronDownIcon className="transition-transform duration-200 group-data-popup-open:rotate-180 group-data-open:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48 rounded-lg shadow-none">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => copyPrompt()}>
              <SparklesIcon />
              Copy prompt
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
