"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { docsNav } from "@/lib/docs"
import { cn } from "@/lib/utils"

export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-56 shrink-0 overflow-y-auto border-r py-6 pr-4 lg:block",
        className,
      )}
    >
      <DocsNav pathname={pathname} />
    </aside>
  )
}

export function DocsNav({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-6">
      {docsNav.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {section.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "rounded-md border border-transparent px-2 py-1 text-[0.8rem] font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "border-accent bg-accent text-accent-foreground",
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
