"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { DocsNav } from "@/components/docs-sidebar"
import { LayishMark } from "@/components/layish-mark"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Lock background scroll while the full-bleed menu is open.
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

  // Escape closes the menu (matches shadcn popover dismiss behavior).
  React.useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className={cn("flex items-center gap-1 lg:hidden", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="size-8 shrink-0 p-2 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent"
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
      </Button>
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
      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            // Full-bleed cover under the sticky header. Close only via X, L, or a nav link —
            // not by tapping the panel itself (matches requested mobile UX).
            className="fixed inset-x-0 top-(--header-height) bottom-0 z-40 overflow-y-auto bg-background/90 backdrop-blur lg:hidden"
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
          </div>,
          document.body,
        )}
    </div>
  )
}
