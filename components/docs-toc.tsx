"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { DocsTocItem } from "@/lib/docs"

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" },
    )

    for (const id of itemIds) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [itemIds])

  return activeId
}

export function DocsTableOfContents({
  toc,
  className,
}: {
  toc: DocsTocItem[]
  className?: string
}) {
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  )
  const activeHeading = useActiveItem(itemIds)

  if (toc.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-2 text-sm", className)}>
      <p className="text-xs font-medium text-muted-foreground">On This Page</p>
      {toc.map((item) => (
        <a
          key={item.url}
          href={item.url}
          data-active={item.url === `#${activeHeading}`}
          className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground"
        >
          {item.title}
        </a>
      ))}
    </div>
  )
}
