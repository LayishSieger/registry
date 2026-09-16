export type DocsNavItem = {
  title: string
  href: string
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

export const docsNav: DocsNavSection[] = [
  {
    title: "Get Started",
    items: [{ title: "Introduction", href: "/docs" }],
  },
  {
    title: "Components",
    items: [
      {
        title: "Ask",
        href: "/docs/components/ask",
      },
    ],
  },
]

export type DocsTocItem = {
  title: string
  url: string
}

export const askToc: DocsTocItem[] = [
  { title: "Installation", url: "#installation" },
  { title: "Usage", url: "#usage" },
  { title: "Auto-advance", url: "#auto-advance" },
  { title: "Review", url: "#review" },
  { title: "Cancel", url: "#cancel" },
  { title: "Keyboard", url: "#keyboard" },
  { title: "AI SDK HITL", url: "#ai-sdk-hitl" },
  { title: "API", url: "#api" },
]
