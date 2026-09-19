import { registryInstallCommand, siteConfig } from "@/lib/site"

export const composerTitle = "Composer"
export const composerDescription =
  "A prompt shell on input-group with mode and mic slots shaped for AI SDK useChat."

export const composerInstallCommand = registryInstallCommand("composer")

export const composerUsage = `import { useState } from "react"
import { Composer } from "@/components/composer"

export function Example() {
  const [text, setText] = useState("")
  // const { sendMessage, status, stop } = useChat(...)

  return (
    <Composer
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

Enter sends. Shift+Enter inserts a newline. Attach + mode sit on the start of the toolbar; mic + circular ↑ send on the end.

## Keyboard

| Shortcut | Action |
| --- | --- |
| ⌘/Ctrl+Shift+A | Attach |
| ⌘/Ctrl+Shift+O | Mode |
| ⌘/Ctrl+Shift+D | Dictation / mic slot |
| Enter / ⌘/Ctrl+Enter | Send (or stop when busy) |
| Shift+Enter | Newline |

On fine-pointer (desktop) keyboards, modifier is ⌘ on macOS and Ctrl elsewhere; both ⌘ and Ctrl currently match as Mod. Shortcuts only run while focus is inside the composer. On touch / coarse pointers, Mod shortcuts and tooltips are off and Enter inserts a newline (send with the button). Tooltips dismiss on click.

\`shortcuts={false}\` disables the Mod action bindings (attach / mode / dictation / Mod+Enter from the window listener) and tooltips. It does **not** change field Enter behavior: Shift+Enter still inserts a newline, and Enter / ⌘/Ctrl+Enter still send or stop per \`enterKeyBehavior\` (on fine pointers). Use a coarse pointer / touch device for newline-only Enter, or set \`enterKeyBehavior\` as needed.

## Slots

- \`modeSlot\` — purpose modes (Ask / Plan / Debug). Host owns content, behavior, and styling. Not a built-in model picker.
- \`micSlot\` — visual slot. Pass \`null\` to hide the default mic affordance. Wire voice yourself (see SpeechInput below).
- \`attachSlot\` — replace the default + file picker. Default attach selects files and includes them on \`onSubmit({ files })\`.

## SpeechInput (optional)

Composer does **not** depend on AI Elements. For voice, install [SpeechInput](${siteConfig.links.speechInput}) and pass it into \`micSlot\`:

\`\`\`bash
npx ai-elements@latest add speech-input
\`\`\`

\`\`\`tsx
${composerSpeechUsage}
\`\`\`

**Billing:** In Chrome/Edge, SpeechInput uses the browser **Web Speech API** — free for the end user, no Layish tokens, no OpenAI/Vercel keys. For Firefox/Safari, optionally provide \`onAudioRecorded\` (e.g. Whisper); that path is paid by whoever owns the transcription API key.

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
| \`enterKeyBehavior\` | \`"submit" \\| "focus-send"\` | \`"submit"\` | Enter in the field (fine pointer only). |
| \`shortcuts\` | \`boolean\` | \`true\` | Mod action shortcuts (attach / mode / dictation) when focus is inside and pointer is fine. Does not disable field Enter / Shift+Enter / Mod+Enter send. |
| \`shortcutTooltips\` | \`boolean\` | \`true\` | Kbd tooltips on attach / mode / mic / send (requires \`shortcuts\` + fine pointer). |
| \`modeSlot\` | \`ReactNode \\| (props) => ReactNode\` | — | Purpose mode control. |
| \`micSlot\` | \`ReactNode \\| (props) => ReactNode\` | default mic | Voice affordance slot. \`null\` hides it. |
| \`attachSlot\` | \`ReactNode \\| (props) => ReactNode\` | default + | Attach control. |
| \`placeholder\` | \`string\` | \`"Ask anything…"\` | Field placeholder. |
| \`disabled\` | \`boolean\` | \`false\` | Disable the shell. |
| \`className\` | \`string\` | — | Classes on the input-group shell. |
| \`accept\` / \`multiple\` | file input attrs | \`multiple\` true | Default attach picker. |
| \`onFilesChange\` | \`(files: File[]) => void\` | — | When selected files change. |

### \`ComposerSubmit\`

\`\`\`ts
type ComposerSubmit = { text: string; files?: File[] }
\`\`\`
`
