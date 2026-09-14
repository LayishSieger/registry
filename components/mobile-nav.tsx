"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { DocsNav } from "@/components/docs-sidebar"
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 gap-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 lg:hidden",
            className,
          )}
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
          <span className="sr-only">Toggle menu</span>
          <span className="font-medium">Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={12}
        alignOffset={-16}
        className="h-(--radix-popover-content-available-height) w-screen overflow-y-auto rounded-none border-none bg-background p-0 shadow-none"
      >
        <div className="flex flex-col gap-8 px-6 py-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Menu</p>
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
