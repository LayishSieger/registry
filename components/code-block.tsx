import { CodeCopyButton } from "@/components/code-copy-button"
import { highlightCode } from "@/lib/highlight-code"
import { cn } from "@/lib/utils"

export { InstallCommand } from "@/components/copy-command"

export async function CodeBlock({
  code,
  language = "tsx",
  className,
}: {
  code: string
  language?: string
  className?: string
}) {
  const html = await highlightCode(code, language)

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/50",
        className,
      )}
    >
      <div className="absolute top-2 right-2 z-10">
        <CodeCopyButton value={code} label="Copy code" />
      </div>
      <div
        className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0 [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
