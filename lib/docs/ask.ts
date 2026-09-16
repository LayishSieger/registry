import { installCommand, siteConfig } from "@/lib/site"

export const askTitle = "Ask"
export const askDescription =
  "A questionnaire wrap with review, cancel, auto-advance, and HITL-shaped results for AI SDK addToolOutput."

export const askUsage = `import { Ask } from "@/components/ask"

const items = [
  {
    name: "direction",
    title: "Which direction?",
    required: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
    ],
  },
]

export function Example() {
  return (
    <Ask
      items={items}
      onResult={(result) => {
        // HITL: addToolOutput({ output: result })
      }}
    />
  )
}`

export const askMarkdown = `# ${askTitle}

${askDescription}

Built on [shadcn Questionnaire](${siteConfig.links.questionnaire}). Distributed as a [shadcn registry](${siteConfig.links.shadcnRegistry}) block.

## Installation

\`\`\`bash
${installCommand}
\`\`\`

The CLI copies the block into your project. You own the source.

This is a GitHub registry, so the CLI reads \`registry.json\` from [${siteConfig.links.github}](${siteConfig.links.github}).

## Usage

\`\`\`tsx
${askUsage}
\`\`\`

\`onResult\` is the HITL payload. Submit returns \`{ status: "submitted", answers }\`. Cancel returns \`{ status: "canceled" }\`. Pass that object to \`addToolOutput({ output })\`.

## Auto-advance

Set \`autoAdvance\` on a single-choice item. The first pick advances. Other commits on Enter. After Back, Next comes back. \`multiple\` items do not auto-advance.

## Review

Set \`review\` on the batch. Last-slide auto-advance and Other commit go to review, not submit.

## Cancel

Set \`cancel\` on the batch. Confirm before discarding answers.

## Keyboard

Arrow keys navigate. Enter continues or submits. Number (or letter) keys pick choices. Navigation shortcuts appear as tooltips on Previous / Skip / Next / Submit when \`shortcutTooltips\` is enabled (default). Set \`shortcuts={false}\` to disable answer keys and tooltips, or \`shortcutTooltips={false}\` to keep bindings without hover hints.

## AI SDK HITL

\`onResult\` is the tool output. The host passes it to \`addToolOutput\`.

## API

### \`Ask\`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`items\` | \`AskItem[]\` | — | Questions to render, in order. |
| \`onResult\` | \`(result: AskResult) => void\` | — | HITL-shaped result for \`addToolOutput\`. |
| \`onSubmit\` | \`(event: FormEvent) => void\` | — | Native form submit. Prefer \`onResult\` for HITL. |
| \`review\` | \`boolean\` | \`false\` | Show a review step before submit. |
| \`cancel\` | \`boolean\` | \`false\` | Show a confirm-to-cancel control. |
| \`onCancel\` | \`() => void\` | — | Called after cancel is confirmed. |
| \`autoAdvanceDelay\` | \`number\` | \`380\` | Delay in ms before auto-advance. |
| \`shortcuts\` | \`"numbers" \\| "letters" \\| false\` | \`"numbers"\` | Answer shortcut keys. |
| \`shortcutTooltips\` | \`boolean\` | \`true\` | Kbd tooltips on Previous / Skip / Next / Submit (requires \`shortcuts\` ≠ \`false\`). |
| \`labels\` | \`AskLabels\` | — | Override action and cancel copy. |
| \`defaultItem\` | \`string\` | first item | Uncontrolled starting question. |
| \`item\` | \`string\` | — | Controlled active question. |
| \`onItemChange\` | \`(item: string) => void\` | — | Controlled navigation. |
| \`className\` | \`string\` | — | Layout classes on the root. |

### \`AskItem\`

| Field | Type | Description |
| --- | --- | --- |
| \`name\` | \`string\` | Field name and step id. |
| \`title\` | \`string\` | Question title. |
| \`description\` | \`string\` | Optional supporting copy. |
| \`required\` | \`boolean\` | Block Next/Submit until answered. |
| \`choices\` | \`{ value, label }[]\` | Fixed answers. |
| \`input\` | \`{ label, placeholder? }\` | Optional Other/freeform answer. |
| \`multiple\` | \`boolean\` | Checkbox answers. Disables \`autoAdvance\`. |
| \`autoAdvance\` | \`boolean\` | Advance after a single pick. Not valid with \`multiple\`. |

### \`AskResult\`

\`\`\`ts
type AskResult =
  | { status: "submitted"; answers: AskAnswer[] }
  | { status: "canceled" }
\`\`\`
`
