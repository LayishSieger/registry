import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"

import { CodeBlock } from "@/components/code-block"
import {
  ComposerDefaultPreview,
  ComposerFocusSendPreview,
  ComposerSpeechInputPreview,
  ComposerUseChatPreview,
} from "@/components/composer-preview"
import { CopyCommand } from "@/components/copy-command"
import { DocsPageHeader } from "@/components/docs-page-header"
import { DocsTableOfContents } from "@/components/docs-toc"
import { RegistryExample } from "@/components/registry-example"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { composerToc } from "@/lib/docs"
import {
  composerDescription,
  composerInstallCommand,
  composerMarkdown,
  composerSpeechUsage,
  composerTitle,
  composerUsage,
} from "@/lib/docs/composer"
import { siteConfig } from "@/lib/site"

const pagePath = "/docs/components/composer"

export const metadata: Metadata = {
  title: composerTitle,
  description: composerDescription,
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

export default function ComposerPage() {
  return (
    <div className="flex items-start">
      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-10 py-8 lg:py-10">
        <DocsPageHeader
          title={composerTitle}
          description={composerDescription}
          markdown={composerMarkdown}
          path={pagePath}
        />
        <p className="text-sm text-muted-foreground">
          Built on{" "}
          <Link
            href={siteConfig.links.inputGroup}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            shadcn Input Group
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
          name="composer"
          title="Composer"
          description="Multi-line prompt with attach, mode slot, mic slot, and circular ↑ send."
        >
          <ComposerDefaultPreview />
        </RegistryExample>
        <section className="flex flex-col gap-3">
          <Heading id="installation">Installation</Heading>
          <CopyCommand command={composerInstallCommand} />
          <p className="text-sm text-muted-foreground">
            The CLI copies the block into your project. You own the source.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="usage">Usage</Heading>
          <CodeBlock code={composerUsage} />
          <p className="text-sm text-muted-foreground">
            Host owns transport. Wire{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              onSubmit
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              status
            </code>
            , and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              onStop
            </code>{" "}
            from{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              useChat
            </code>
            . The block does not import{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              @ai-sdk/react
            </code>
            .
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="enter-key">Enter key</Heading>
          <p className="text-sm text-muted-foreground">
            Default Enter sends. Shift+Enter inserts a newline. Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              enterKeyBehavior=&quot;focus-send&quot;
            </code>{" "}
            so the first Enter focuses send and the second Enter submits.
          </p>
          <RegistryExample>
            <ComposerFocusSendPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="keyboard">Keyboard</Heading>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 font-medium">Shortcut</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 pr-4 text-foreground">
                    <KbdGroup>
                      <Kbd>Mod</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>A</Kbd>
                    </KbdGroup>
                  </td>
                  <td className="py-2">Attach</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 text-foreground">
                    <KbdGroup>
                      <Kbd>Mod</Kbd>
                      <Kbd>/</Kbd>
                    </KbdGroup>
                  </td>
                  <td className="py-2">Mode</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 text-foreground">
                    <KbdGroup>
                      <Kbd>Mod</Kbd>
                      <Kbd>Shift</Kbd>
                      <Kbd>D</Kbd>
                    </KbdGroup>
                  </td>
                  <td className="py-2">Dictation / mic</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 text-foreground">
                    <KbdGroup>
                      <Kbd>Enter</Kbd>
                      <span className="text-muted-foreground">/</span>
                      <Kbd>Mod</Kbd>
                      <Kbd>Enter</Kbd>
                    </KbdGroup>
                  </td>
                  <td className="py-2">Send (or stop when busy)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-foreground">
                    <KbdGroup>
                      <Kbd>Shift</Kbd>
                      <Kbd>Enter</Kbd>
                    </KbdGroup>
                  </td>
                  <td className="py-2">Newline</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            <Kbd>Mod</Kbd> is ⌘ on macOS and Ctrl elsewhere. Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              shortcuts=&#123;false&#125;
            </code>{" "}
            to disable.
          </p>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="speech-input">SpeechInput</Heading>
          <p className="text-sm text-muted-foreground">
            The registry block keeps{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              micSlot
            </code>{" "}
            only — no AI Elements dependency. Install{" "}
            <Link
              href={siteConfig.links.speechInput}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              SpeechInput
            </Link>{" "}
            from{" "}
            <Link
              href={siteConfig.links.aiElements}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              AI Elements
            </Link>{" "}
            when you want voice. In Chrome/Edge it uses the browser Web Speech
            API — free, no Layish tokens or API keys. Optional{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              onAudioRecorded
            </code>{" "}
            (Whisper/etc.) is host-paid if you wire it for Firefox/Safari.
          </p>
          <CopyCommand command="npx ai-elements@latest add speech-input" />
          <CodeBlock code={composerSpeechUsage} />
          <RegistryExample
            title="SpeechInput in micSlot"
            description="Appends final transcripts into the composer value."
          >
            <ComposerSpeechInputPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-3">
          <Heading id="ai-sdk">AI SDK</Heading>
          <p className="text-sm text-muted-foreground">
            Map{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              sendMessage
            </code>
            ,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              status
            </code>
            , and{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
              stop
            </code>
            . Busy status flips the primary control to stop.
          </p>
          <RegistryExample>
            <ComposerUseChatPreview />
          </RegistryExample>
        </section>
        <section className="flex flex-col gap-4">
          <Heading id="api">API</Heading>
          <h3 className="text-sm font-medium">Composer</h3>
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
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    value / onValueChange
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    controlled text
                  </td>
                  <td className="py-2">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    onSubmit
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    (message) =&gt; void
                  </td>
                  <td className="py-2">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    status
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    ready | submitted | streaming | error
                  </td>
                  <td className="py-2 font-mono text-[0.8rem]">ready</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    onStop
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    () =&gt; void
                  </td>
                  <td className="py-2">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    enterKeyBehavior
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    submit | focus-send
                  </td>
                  <td className="py-2 font-mono text-[0.8rem]">submit</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    shortcuts
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">boolean</td>
                  <td className="py-2 font-mono text-[0.8rem]">true</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    modeSlot / micSlot / attachSlot
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    ReactNode | render prop
                  </td>
                  <td className="py-2">mic + attach defaults</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-[0.8rem] text-foreground">
                    className / disabled
                  </td>
                  <td className="py-2 pr-4 font-mono text-[0.8rem]">
                    layout / disable
                  </td>
                  <td className="py-2">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div className="sticky top-(--header-height) hidden h-[calc(100svh-var(--header-height))] w-52 shrink-0 overflow-y-auto py-10 pl-8 xl:block">
        <DocsTableOfContents toc={composerToc} />
      </div>
    </div>
  )
}
