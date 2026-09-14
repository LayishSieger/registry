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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        {markdown && path ? (
          <div className="w-fit shrink-0">
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
