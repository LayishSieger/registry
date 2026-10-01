"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getDocsAdjacent } from "@/lib/docs"

export function DocsPager() {
  const pathname = usePathname()
  const { previous, next } = getDocsAdjacent(pathname)

  if (!previous && !next) return null

  return (
    <div className="flex items-center gap-2">
      {previous ? (
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-8 shadow-none md:size-7"
          nativeButton={false}
          render={
            <Link
              href={previous.href}
              aria-label={`Previous: ${previous.title}`}
            />
          }
        >
          <ChevronLeftIcon />
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-8 shadow-none md:size-7"
          disabled
          aria-label="No previous page"
        >
          <ChevronLeftIcon />
        </Button>
      )}
      {next ? (
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-8 shadow-none md:size-7"
          nativeButton={false}
          render={
            <Link href={next.href} aria-label={`Next: ${next.title}`} />
          }
        >
          <ChevronRightIcon />
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-8 shadow-none md:size-7"
          disabled
          aria-label="No next page"
        >
          <ChevronRightIcon />
        </Button>
      )}
    </div>
  )
}
