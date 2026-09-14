export const siteConfig = {
  name: "Layish",
  description: "A registry of composed blocks on top of shadcn.",
  links: {
    github: "https://github.com/layishsieger/registry",
    shadcn: "https://ui.shadcn.com",
    shadcnRegistry: "https://ui.shadcn.com/docs/registry",
    questionnaire: "https://ui.shadcn.com/docs/components/base/questionnaire",
  },
  navItems: [
    { href: "/", label: "Home" },
    { href: "/docs/components", label: "Components" },
  ],
}

export const githubRegistry = {
  owner: "layishsieger",
  repo: "registry",
  item: "ask",
}

export const installCommand = `npx shadcn@latest add ${githubRegistry.owner}/${githubRegistry.repo}/${githubRegistry.item}`

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl().replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
