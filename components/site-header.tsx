"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { GitHubLink } from "@/components/github-link"
import { MobileNav } from "@/components/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-(--header-height) w-full max-w-[1400px] items-center gap-4 px-4 md:px-6">
        <MobileNav />
        <Link href="/" className="flex items-center">
          <span className="text-sm font-medium">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center lg:flex">
          {siteConfig.navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link
                  href={item.href}
                  data-active={isActive}
                  className={cn(
                    "text-muted-foreground",
                    isActive && "bg-accent text-foreground",
                  )}
                >
                  {item.label}
                </Link>
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
