import { askMarkdown } from "@/lib/docs/ask"

export function GET() {
  return new Response(askMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
