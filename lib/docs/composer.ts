import { registryInstallCommand, siteConfig } from "@/lib/site"

export const composerTitle = "Composer"
export const composerDescription =
  "A two-form prompt shell on input-group — compact pill or expanded auto-grow — with mode and mic slots shaped for AI SDK useChat."

export const composerInstallCommand = registryInstallCommand("composer")

export const composerUsage = `import { useState } from "react"
import { Composer } from "@/components/composer"

export function Example() {
  const [text, setText] = useState("")
  // const { sendMessage, status, stop } = useChat(...)

  return (
    <Composer
      form="compact"
      value={text}
      onValueChange={setText}
      status="ready"
      onStop={() => {
        // stop()
      }}
      onSubmit={({ text, files }) => {
        // sendMessage({ text, files })
        setText("")
      }}
      modeSlot={<button type="button">Ask</button>}
    />
  )
}`

export const composerSpeechUsage = `import { useState } from "react"
import { Composer } from "@/components/composer"
import { SpeechInput } from "@/components/ai-elements/speech-input"

export function Example() {
  const [text, setText] = useState("")

  return (
    <Composer
      form="compact"
      value={text}
      onValueChange={setText}
      micSlot={({ disabled }) => (
        <SpeechInput
          size="icon-sm"
          variant="ghost"
          disabled={disabled}
          onTranscriptionChange={(transcript) => {
            const next = transcript.trim()
            if (!next) return
            setText((current) => {
              const base = current.trim()
              return base ? \`\${base} \${next}\` : next
            })
          }}
        />
      )}
    />
  )
}`

export const composerMarkdown = `# ${composerTitle}

${composerDescription}

Built on [shadcn Input Group](${siteConfig.links.inputGroup}). Distributed as a [shadcn registry](${siteConfig.links.shadcnRegistry}) block.

## Installation

\`\`\`bash
${composerInstallCommand}
\`\`\`

The CLI copies the block into your project. You own the source.

This is a GitHub registry, so the CLI reads \`registry.json\` from [${siteConfig.links.github}](${siteConfig.links.github}).

## Usage

\`\`\`tsx
${composerUsage}
\`\`\`

Pass \`status\` / \`onStop\` / \`onSubmit\` from the host. The block does not depend on \`@ai-sdk/react\`.

## Forms

- \`form="compact"\` — one-line pill (screenshot language): circular +, mode slot, mic slot, circular ↑ send.
- \`form="expanded"\` — auto-growing textarea; toolbar on \`block-end\` (attach left, mode/mic/send right). Shift+Enter inserts a newline.

## Enter key

Default \`enterKeyBehavior="submit"\` sends on Enter. Set \`enterKeyBehavior="focus-send"\` so the first Enter focuses the send button and the second Enter sends.

## Slots

- \`modeSlot\` — purpose modes (Ask / Plan / Debug). Host owns content and behavior. Not a built-in model picker.
- \`micSlot\` — visual slot only in the registry block. Pass \`null\` to hide the default mic affordance. Wire voice yourself (see SpeechInput below).
- \`attachSlot\` — replace the default + file picker. Default attach selects files and includes them on \`onSubmit({ files })\`.

## SpeechInput (optional)

Composer does **not** depend on AI Elements. For voice, install [SpeechInput](${siteConfig.links.speechInput}) and pass it into \`micSlot\`:

\`\`\`bash
npx ai-elements@latest add speech-input
\`\`\`

\`\`\`tsx
${composerSpeechUsage}
\`\`\`

In Chrome/Edge, SpeechInput uses the Web Speech API — no API keys. For Firefox/Safari, optionally provide \`onAudioRecorded\` (e.g. Whisper); that path is host/docs-only.

## AI SDK

\`\`\`tsx
const { sendMessage, status, stop } = useChat(/* … */)
const [text, setText] = useState("")

<Composer
  value={text}
  onValueChange={setText}
  status={status}
  onStop={stop}
  onSubmit={({ text, files }) => {
    sendMessage({ text, files })
    setText("")
  }}
/>
\`\`\`

While \`status\` is \`submitted\` or \`streaming\`, the primary control becomes stop.

## API

### \`Composer\`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`value\` | \`string\` | — | Controlled text. |
| \`defaultValue\` | \`string\` | \`""\` | Uncontrolled initial text. |
| \`onValueChange\` | \`(value: string) => void\` | — | Text change. |
| \`onSubmit\` | \`(message: ComposerSubmit) => void\` | — | Send payload for \`sendMessage\`. |
| \`status\` | \`"ready" \\| "submitted" \\| "streaming" \\| "error"\` | \`"ready"\` | Drives send vs stop. |
| \`onStop\` | \`() => void\` | — | Called when stop is pressed while busy. |
| \`form\` | \`"compact" \\| "expanded"\` | \`"compact"\` | Visual form. |
| \`enterKeyBehavior\` | \`"submit" \\| "focus-send"\` | \`"submit"\` | Enter in the field. |
| \`modeSlot\` | \`ReactNode \\| (props) => ReactNode\` | — | Purpose mode control. |
| \`micSlot\` | \`ReactNode \\| (props) => ReactNode\` | default mic | Voice affordance slot. \`null\` hides it. |
| \`attachSlot\` | \`ReactNode \\| (props) => ReactNode\` | default + | Attach control. |
| \`placeholder\` | \`string\` | \`"Message…"\` | Field placeholder. |
| \`disabled\` | \`boolean\` | \`false\` | Disable the shell. |
| \`className\` | \`string\` | — | Classes on the input-group shell. |
| \`accept\` / \`multiple\` | file input attrs | \`multiple\` true | Default attach picker. |
| \`onFilesChange\` | \`(files: File[]) => void\` | — | When selected files change. |

### \`ComposerSubmit\`

\`\`\`ts
type ComposerSubmit = { text: string; files?: File[] }
\`\`\`
`
