"use client"

import * as React from "react"

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
          "flex items-center gap-2 overflow-x-auto rounded-lg border bg-muted/50 px-3 py-2 font-mono text-sm",
          className,
        )}
      >
        <pre className="min-w-0 flex-1 overflow-x-auto">
          <code>{command}</code>
        </pre>
        <CodeCopyButton value={command} label="Copy command" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-muted/50",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-2">
        <div
          role="tablist"
          aria-label="Package manager"
          className="flex min-w-0 items-center gap-0.5 overflow-x-auto py-1"
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
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
                onClick={() => setPackageManager(pm)}
              >
                {pm}
              </button>
            )
          })}
        </div>
        <CodeCopyButton value={activeCommand} label="Copy command" />
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-sm">
        <code>{activeCommand}</code>
      </pre>
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
