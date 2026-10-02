"use client"

import * as React from "react"
import { TerminalIcon } from "lucide-react"

import { CodeCopyButton } from "@/components/code-copy-button"
import {
  PACKAGE_MANAGERS,
  getPackageManagerServerSnapshot,
  getPackageManagerSnapshot,
  packageManagerCommands,
  setPackageManager,
  subscribePackageManager,
} from "@/lib/package-managers"
import { cn } from "@/lib/utils"

export function CopyCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  const commands = React.useMemo(
    () => packageManagerCommands(command),
    [command],
  )
  const packageManager = React.useSyncExternalStore(
    subscribePackageManager,
    getPackageManagerSnapshot,
    getPackageManagerServerSnapshot,
  )

  const activeCommand = commands ? commands[packageManager] : command

  if (!commands) {
    return (
      <div
        className={cn(
          "relative overflow-x-auto rounded-lg border bg-muted/50 font-mono text-sm",
          className,
        )}
      >
        <pre className="min-w-0 overflow-x-auto px-3 py-2 pr-12">
          <code>{command}</code>
        </pre>
        <CodeCopyButton
          value={command}
          label="Copy command"
          className="absolute top-2 right-2 z-10"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted/50",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-1.5 pr-12">
        <div
          className="flex size-4 shrink-0 items-center justify-center rounded-[1px] bg-foreground opacity-70"
          aria-hidden
        >
          <TerminalIcon className="size-3 text-background" />
        </div>
        <div
          role="tablist"
          aria-label="Package manager"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
        >
          {PACKAGE_MANAGERS.map((pm) => {
            const selected = packageManager === pm
            return (
              <button
                key={pm}
                type="button"
                role="tab"
                aria-selected={selected}
                className={cn(
                  "h-7 rounded-md border border-transparent px-2.5 text-xs font-medium transition-colors shadow-none",
                  selected
                    ? "border-input bg-background text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
                onClick={() => setPackageManager(pm)}
              >
                {pm}
              </button>
            )
          })}
        </div>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-sm">
        <code>{activeCommand}</code>
      </pre>
      <CodeCopyButton
        value={activeCommand}
        label="Copy command"
        className="absolute top-2 right-2 z-10"
      />
    </div>
  )
}

export function InstallCommand({
  command,
  className,
}: {
  command: string
  className?: string
}) {
  return <CopyCommand command={command} className={className} />
}
