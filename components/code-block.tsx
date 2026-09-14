import { CopyCommand } from "@/components/copy-command"
import { cn } from "@/lib/utils"

export function CodeBlock({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-[13px] leading-relaxed",
        className,
      )}
    >
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function InstallCommand({ command }: { command: string }) {
  return <CopyCommand command={command} />
}
