import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"

import { CodeBlock } from "@/components/code-block"
import { CopyCommand } from "@/components/copy-command"
import { DocsPageHeader } from "@/components/docs-page-header"
import { DocsTableOfContents } from "@/components/docs-toc"
import {
  AskAutoAdvancePreview,
  AskCancelPreview,
  AskDefaultPreview,
  AskHitlPreview,
  AskPlainPreview,
  AskReviewPreview,
} from "@/components/ask-preview"
import { AskKeyboardDocs } from "@/components/ask-keyboard-docs"
import { RegistryExample } from "@/components/registry-example"
import { askToc } from "@/lib/docs"
import {
  askDescription,
  askMarkdown,
  askTitle,
  askUsage,
} from "@/lib/docs/ask"
import { installCommand, siteConfig } from "@/lib/site"

const pagePath = "/docs/components/ask"

export const metadata: Metadata = {
  title: askTitle,
  description: askDescription,
}

function Heading({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xl font-medium tracking-tight"
    >
      {children}
    </h2>
  )
}

export default function AskPage() {
  return (
    <div className="flex items-start">
      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-10 py-8 lg:py-10">
        <DocsPageHeader
          title={askTitle}
          description={askDescription}
          markdown={askMarkdown}
          path={pagePath}
        />
        <p className="text-sm text-muted-foreground">
          Built on{" "}
          <Link
            href={siteConfig.links.questionnaire}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            shadcn Questionnaire
          </Link>
          . Distributed as a{" "}
          <Link
            href={siteConfig.links.shadcnRegistry}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            shadcn registry
          </Link>{" "}
          block from{" "}
          <Link
            href={siteConfig.links.github}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            GitHub
          </Link>
          .
        </p>
        <RegistryExample
          name="ask"
          title="Default"
          description="Card shell with answer subtext. Submit shows a toast. Hold ⌘/Ctrl to reveal inline Kbd on actions."
        >
          <AskDefaultPreview />
        </RegistryExample>
        <section className="flex flex-col gap-3">
          <Heading id="installation">Installation</Heading>
          <CopyCommand command={installCommand} />
          <p className="text-sm text-muted-foreground">
            The CLI copies the block into your project. You own the source.
            Mount a root{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              {"<Toaster />"}
            </code>{" "}
            if you enable{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              toastOnSubmit
            </code>
            .
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="usage">Usage</Heading>
          <CodeBlock code={askUsage} />
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              onResult
            </code>{" "}
            is the HITL payload. Submit returns{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              {`{ status: "submitted", answers }`}
            </code>
            . Cancel returns{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              {`{ status: "canceled" }`}
            </code>
            . Pass that object to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              addToolOutput({`{ output }`})
            </code>
            .
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="variants">Variants</Heading>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              variant=&quot;plain&quot;
            </code>{" "}
            drops the card background and uses bordered answer rows (Questionnaire
            look). Choice{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              description
            </code>{" "}
            adds optional subtext under each label.
          </p>
          <RegistryExample>
            <AskPlainPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="auto-advance">Auto-advance</Heading>
          <p className="text-sm text-muted-foreground">
            First pick auto-advances. Other Enter commits and advances. After
            Back, Next comes back.
          </p>
          <RegistryExample>
            <AskAutoAdvancePreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="review">Review</Heading>
          <p className="text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">review</code> on
            the batch. Last-slide auto-advance and Other commit go to review,
            not submit.
          </p>
          <RegistryExample>
            <AskReviewPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="cancel">Cancel</Heading>
          <p className="text-sm text-muted-foreground">
            Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">cancel</code> on
            the batch. Confirm before discarding answers.
          </p>
          <RegistryExample>
            <AskCancelPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="keyboard">Keyboard</Heading>
          <AskKeyboardDocs />
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="ai-sdk-hitl">AI SDK HITL</Heading>
          <p className="text-sm text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              onResult
            </code>{" "}
            is the tool output. The host passes it to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              addToolOutput
            </code>
            .
          </p>
          <RegistryExample>
            <AskHitlPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-4">
          <Heading id="api">API</Heading>
          <h3 className="text-sm font-medium">Ask</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 font-medium">Prop</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 font-medium">Default</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">items</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">AskItem[]</td>
                  <td className="py-2">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">onResult</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">(result) =&gt; void</td>
                  <td className="py-2">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">variant</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">&quot;card&quot; | &quot;plain&quot;</td>
                  <td className="py-2 font-mono text-[0.8rem]">&quot;card&quot;</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">toastOnSubmit</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">boolean</td>
                  <td className="py-2 font-mono text-[0.8rem]">false</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">review</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">boolean</td>
                  <td className="py-2 font-mono text-[0.8rem]">false</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">cancel</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">boolean</td>
                  <td className="py-2 font-mono text-[0.8rem]">false</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">shortcuts</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">&quot;numbers&quot; | &quot;letters&quot; | false</td>
                  <td className="py-2 font-mono text-[0.8rem]">&quot;numbers&quot;</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">shortcutHints</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">boolean</td>
                  <td className="py-2 font-mono text-[0.8rem]">true</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">autoAdvanceDelay</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">number</td>
                  <td className="py-2 font-mono text-[0.8rem]">380</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">item / onItemChange</td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">controlled navigation</td>
                  <td className="py-2">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div className="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-52 shrink-0 overflow-y-auto py-10 pl-8 xl:block">
        <DocsTableOfContents toc={askToc} />
      </div>
    </div>
  )
}
