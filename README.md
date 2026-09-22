# Layish

A [shadcn](https://ui.shadcn.com) registry of composed blocks for **AI agents, bots, and chat workflows**.

Opinionated UX on top of shadcn primitives, shaped for [AI SDK](https://ai-sdk.dev) patterns (`useChat`, tool HITL, and related). You copy the source into your project — you own it.

**Docs:** [ui.layishsieger.com](https://ui.layishsieger.com)

## Install

```bash
npx shadcn@latest add layishsieger/registry/<name>
```

Examples:

```bash
npx shadcn@latest add layishsieger/registry/composer
npx shadcn@latest add layishsieger/registry/ask
```

```bash
# List / inspect
npx shadcn@latest list layishsieger/registry
npx shadcn@latest view layishsieger/registry/composer
```

This is a GitHub registry. The CLI reads [`registry.json`](./registry.json). See the [shadcn registry docs](https://ui.shadcn.com/docs/registry).

## Components

Growing library — current blocks:

| Block | Role |
| --- | --- |
| [`composer`](https://ui.layishsieger.com/docs/components/composer) | Prompt shell (mode / mic / attach slots) for chat input |
| [`ask`](https://ui.layishsieger.com/docs/components/ask) | Questionnaire wrap with HITL-shaped results for tool calls |

More components for agent and chat UIs will land here over time. Full API and demos live on the docs site.

## Scope

**In scope**

- Composed UI blocks for AI / agent / bot / chat surfaces
- shadcn registry distribution (`npx shadcn add …`)
- AI SDK–friendly props and patterns (without hard-requiring the SDK)
- Slots and host-owned behavior where product choices diverge

**Out of scope**

- Full chat shells, message scrollers, or end-to-end agent runtimes
- Provider SDKs, billing, or backend orchestration
- Replacing shadcn primitives — we compose them

## Development

```bash
pnpm install
pnpm registry:build   # writes public/r
pnpm dev
```

Built registry files are written to `public/r`.

Set `NEXT_PUBLIC_SITE_URL=https://ui.layishsieger.com` for canonical absolute URLs (Open Graph, Open in v0). See [`.env.example`](./.env.example).

## Versioning

Releases use [Changesets](https://github.com/changesets/changesets) (GitHub Releases only — not npm). See [VERSIONING.md](./VERSIONING.md) for bump rules and how to add a changeset.

## License

MIT
