"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { GitHubLink } from "@/components/github-link"
import { LayishMark } from "@/components/layish-mark"
import { MobileNav } from "@/components/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

const desktopNavItems = siteConfig.navItems.filter((item) => item.href !== "/")

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-(--header-height) w-full max-w-[1400px] items-center gap-2 px-4 md:gap-4 md:px-6">
        <MobileNav />
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          className="hidden size-8 shrink-0 items-center justify-center lg:flex"
        >
          <LayishMark className="size-6" />
        </Link>
        <nav className="hidden items-center lg:flex">
          {desktopNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    href={item.href}
                    data-active={isActive}
                    className={cn(
                      "text-muted-foreground",
                      isActive && "bg-accent text-foreground",
                    )}
                  />
                }
              >
                {item.label}
              </Button>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <GitHubLink />
          <Separator orientation="vertical" className="mx-1 h-4!" />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
