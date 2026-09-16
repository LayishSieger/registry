# Layish

A [shadcn](https://ui.shadcn.com) registry of composed blocks. Copy a block into your project with the CLI — you own the source.

Docs: [layish.vercel.app](https://layish.vercel.app)

## Composer

A two-form prompt shell (compact pill / expanded auto-grow) on [shadcn Input Group](https://ui.shadcn.com/docs/components/base/input-group), with mode and mic slots shaped for [AI SDK](https://ai-sdk.dev) `useChat`.

```bash
npx shadcn@latest add layishsieger/registry/composer
```

```tsx
import { Composer } from "@/components/composer"

<Composer
  form="compact"
  value={text}
  onValueChange={setText}
  status={status}
  onStop={stop}
  onSubmit={({ text, files }) => {
    sendMessage({ text, files })
    setText("")
  }}
  modeSlot={<button type="button">Ask</button>}
/>
```

## Ask

A questionnaire wrap with review, cancel, auto-advance, and HITL-shaped results for [AI SDK](https://ai-sdk.dev) `addToolOutput`.

Built on [shadcn Questionnaire](https://ui.shadcn.com/docs/components/base/questionnaire).

```bash
npx shadcn@latest add layishsieger/registry/ask
```

```tsx
import { Ask } from "@/components/ask"

<Ask
  items={[
    {
      name: "direction",
      title: "Which direction?",
      required: true,
      choices: [
        { value: "clarify", label: "Ask a clarifying question" },
        { value: "draft", label: "Draft a first version" },
      ],
    },
  ]}
  onResult={(result) => {
    // addToolOutput({ output: result })
  }}
/>
```


`onResult` is the HITL payload:

- Submit → `{ status: "submitted", answers }`
- Cancel → `{ status: "canceled" }`

## Registry

This is a GitHub registry. The CLI reads [`registry.json`](./registry.json) from this repo. See the [shadcn registry docs](https://ui.shadcn.com/docs/registry).

```bash
# List items
npx shadcn@latest list layishsieger/registry

# View an item
npx shadcn@latest view layishsieger/registry/ask
```

## Development

```bash
pnpm install
pnpm dev
pnpm registry:build
```

Built registry files are written to `public/r`.

## License

MIT
