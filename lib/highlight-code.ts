import { codeToHtml } from "shiki"

const highlightCache = new Map<string, string>()

export async function highlightCode(
  code: string,
  language: string = "tsx",
): Promise<string> {
  const cacheKey = `${language}:${code}`
  const cached = highlightCache.get(cacheKey)
  if (cached) return cached

  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  })

  highlightCache.set(cacheKey, html)
  return html
}
