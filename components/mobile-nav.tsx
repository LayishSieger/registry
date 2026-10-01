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
} from "@/components/ui/popover"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const anchorRef = React.useRef<HTMLDivElement>(null)

  const toggle = () => setOpen((value) => !value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        ref={anchorRef}
        className={cn("flex items-center gap-1 lg:hidden", className)}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={toggle}
          className="size-8 shrink-0 p-2 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0"
        >
          <div className="relative size-4">
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-4 bg-foreground transition-all",
                open ? "top-[0.4rem] -rotate-45" : "top-1",
              )}
            />
            <span
              className={cn(
                "absolute left-0 block h-0.5 w-4 bg-foreground transition-all",
                open ? "top-[0.4rem] rotate-45" : "top-2.5",
              )}
            />
          </div>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={toggle}
          className="size-8 shrink-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0"
        >
          <LayishMark className="size-6" />
        </Button>
      </div>
      <PopoverContent
        anchor={anchorRef}
        align="start"
        side="bottom"
        sideOffset={12}
        alignOffset={-16}
        className="h-(--available-height) w-screen overflow-y-auto rounded-none border-none bg-background/55 p-0 shadow-none backdrop-blur-xl supports-backdrop-filter:bg-background/40"
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
