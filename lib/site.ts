export const CANONICAL_SITE_URL = "https://ui.layishsieger.com"

export const siteConfig = {
  name: "Layish",
  description:
    "A shadcn registry of composed blocks for AI agents, bots, and chat workflows (Composer, Ask).",
  links: {
    github: "https://github.com/layishsieger/registry",
    shadcn: "https://ui.shadcn.com",
    shadcnRegistry: "https://ui.shadcn.com/docs/registry",
    questionnaire: "https://ui.shadcn.com/docs/components/base/questionnaire",
    inputGroup: "https://ui.shadcn.com/docs/components/base/input-group",
    speechInput: "https://elements.ai-sdk.dev/components/speech-input",
    aiElements: "https://elements.ai-sdk.dev",
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

export function registryInstallCommand(item: string) {
  return `npx shadcn@latest add ${githubRegistry.owner}/${githubRegistry.repo}/${item}`
}

export const installCommand = registryInstallCommand(githubRegistry.item)

/**
 * Absolute site origin for SSR links (Open in v0, metadataBase).
 * Prefer NEXT_PUBLIC_SITE_URL (= CANONICAL_SITE_URL in production).
 * Preview deployments fall back to VERCEL_URL; local uses localhost.
 */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_URL
  }
  // Preview / production deployment URL when the public site env is unset.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl().replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
