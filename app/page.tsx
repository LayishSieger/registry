import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { AskDefaultPreview } from "@/components/ask-preview"
import { ComposerCompactPreview } from "@/components/composer-preview"
import { Button } from "@/components/ui/button"
import { installCommand, siteConfig } from "@/lib/site"

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-16 md:px-6">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          {siteConfig.description} Copy a block into your project with the CLI.
          You own the source.
        </p>
        <CopyCommand command={installCommand} className="max-w-xl" />
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/docs/components/composer">View Composer</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs/components/ask">View Ask</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={siteConfig.links.shadcnRegistry} target="_blank" rel="noreferrer">
              shadcn registry
            </Link>
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium">Composer</h2>
            <p className="text-sm text-muted-foreground">
              Compact pill prompt with mode and mic slots. Enter sends; busy
              status becomes stop.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/docs/components/composer">Docs</Link>
          </Button>
        </div>
        <div className="flex min-h-[280px] items-center justify-center rounded-lg border bg-background p-6">
          <ComposerCompactPreview />
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium">Ask</h2>
            <p className="text-sm text-muted-foreground">
              Next and Submit. Other is a row — Enter commits, it is not an
              answer while typing.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/docs/components/ask">Docs</Link>
          </Button>
        </div>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-background p-6">
          <AskDefaultPreview />
        </div>
      </section>
    </div>
  )
}
