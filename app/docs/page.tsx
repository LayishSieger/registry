import type { Metadata } from "next"
import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { DocsPageHeader } from "@/components/docs-page-header"
import { installCommand, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Introduction",
  description: siteConfig.description,
}

export default function DocsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-8 lg:py-10">
      <DocsPageHeader
        title="Introduction"
        description="Layish is a shadcn registry of composed blocks. Add a block with the CLI and own the source in your project."
      />
      <div className="flex flex-col gap-4 text-[0.95rem] leading-relaxed">
        <p>
          Blocks are composed on{" "}
          <Link
            href={siteConfig.links.shadcn}
            className="font-medium underline-offset-4 hover:underline"
          >
            shadcn/ui
          </Link>{" "}
          primitives and distributed through the{" "}
          <Link
            href={siteConfig.links.shadcnRegistry}
            className="font-medium underline-offset-4 hover:underline"
          >
            shadcn registry
          </Link>
          . This is a GitHub registry: the CLI reads{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
            registry.json
          </code>{" "}
          from{" "}
          <Link
            href={siteConfig.links.github}
            className="font-medium underline-offset-4 hover:underline"
          >
            {siteConfig.links.github.replace("https://", "")}
          </Link>
          .
        </p>
        <CopyCommand command={installCommand} />
        <p>
          Blocks include{" "}
          <Link
            href="/docs/components/ask"
            className="font-medium underline-offset-4 hover:underline"
          >
            Ask
          </Link>
          , a wrap around{" "}
          <Link
            href={siteConfig.links.questionnaire}
            className="font-medium underline-offset-4 hover:underline"
          >
            Questionnaire
          </Link>{" "}
          with review, cancel, auto-advance, and HITL-shaped results for AI SDK{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
            addToolOutput
          </code>
          , and{" "}
          <Link
            href="/docs/components/composer"
            className="font-medium underline-offset-4 hover:underline"
          >
            Composer
          </Link>
          , a two-form prompt shell on{" "}
          <Link
            href={siteConfig.links.inputGroup}
            className="font-medium underline-offset-4 hover:underline"
          >
            Input Group
          </Link>{" "}
          shaped for{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
            useChat
          </code>
          .
        </p>
      </div>
    </div>
  )
}
