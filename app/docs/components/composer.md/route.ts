import { composerMarkdown } from "@/lib/docs/composer"

export function GET() {
  return new Response(composerMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
