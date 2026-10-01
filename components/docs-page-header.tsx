import { DocsCopyPage } from "@/components/docs-copy-page"

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
        {markdown && path ? (
          <div className="shrink-0 pt-1">
            <DocsCopyPage markdown={markdown} path={path} />
          </div>
        ) : null}
      </div>
      <p className="max-w-[80%] text-base text-pretty text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
