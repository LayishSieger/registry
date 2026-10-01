"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { DocsNav } from "@/components/docs-sidebar"
import { LayishMark } from "@/components/layish-mark"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Lock background scroll while the full-bleed menu is open (shadcn-style overlay).
  React.useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
    }
  }, [open])

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        // Close only via the X trigger, L home mark, nav links, or Escape —
        // not by tapping the page behind / beside the overlay.
        if (!nextOpen && eventDetails.reason === "outside-press") {
          eventDetails.cancel()
          return
        }
        setOpen(nextOpen)
      }}
    >
      <div className={cn("flex items-center gap-1 lg:hidden", className)}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle menu"
              className="size-8 shrink-0 p-2 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent"
            />
          }
        >
          <div className="relative size-4">
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                open ? "top-[0.4rem] -rotate-45" : "top-1",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                open ? "top-[0.4rem] rotate-45" : "top-2.5",
              )}
            />
          </div>
        </PopoverTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          aria-label={`${siteConfig.name} home`}
          className="size-8 shrink-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent"
          render={
            <Link
              href="/"
              onClick={() => {
                setOpen(false)
              }}
            />
          }
        >
          <LayishMark className="size-6" />
        </Button>
      </div>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={14}
        alignOffset={-16}
        className="h-(--available-height) w-(--available-width) max-w-none overflow-y-auto rounded-none border-none bg-background/55 p-0 shadow-none ring-0 backdrop-blur-xl duration-100 data-open:animate-none data-closed:animate-none supports-backdrop-filter:bg-background/40"
      >
        <div className="flex flex-col gap-8 px-6 py-6">
          <div className="flex flex-col gap-3">
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-lg font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <DocsNav pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
