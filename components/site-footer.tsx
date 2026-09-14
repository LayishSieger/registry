import Link from "next/link"

import { siteConfig } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:px-6">
        <p>
          Built on{" "}
          <Link
            href={siteConfig.links.shadcnRegistry}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            shadcn registry
          </Link>
          . Question Batch wraps{" "}
          <Link
            href={siteConfig.links.questionnaire}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Questionnaire
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
