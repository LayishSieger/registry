import { DocsCopyPage } from "@/components/docs-copy-page"
import { DocsPager } from "@/components/docs-pager"

export function DocsPageHeader({
  title,
  description,
  markdown,
  path,
}: {
  title: string
  description: string
  markdown?: string
  path?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 flex-1 scroll-m-24 text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <div className="ml-auto flex shrink-0 items-center gap-2 pt-1">
          {markdown && path ? (
            <DocsCopyPage markdown={markdown} path={path} />
          ) : null}
          <DocsPager />
        </div>
      </div>
      <p className="max-w-[80%] text-base text-pretty text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
