"use client"

import { AskShortcutKbd, ASK_SHORTCUTS } from "@/registry/new-york/blocks/ask/ask"
import { Kbd } from "@/components/ui/kbd"

const ROWS = [
  { shortcut: ASK_SHORTCUTS.previous, action: "Previous / leave review" },
  { shortcut: ASK_SHORTCUTS.next, action: "Next or Skip" },
  { shortcut: ASK_SHORTCUTS.submit, action: "Continue / Submit" },
] as const

export function AskKeyboardDocs() {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium">Shortcut</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {ROWS.map((row) => (
              <tr key={row.shortcut + row.action} className="border-b">
                <td className="py-2 pr-4 text-foreground">
                  <AskShortcutKbd shortcut={row.shortcut} />
                </td>
                <td className="py-2">{row.action}</td>
              </tr>
            ))}
            <tr className="border-b">
              <td className="py-2 pr-4 text-foreground">
                <span className="inline-flex items-center gap-1">
                  <Kbd>1</Kbd>
                  <span className="text-muted-foreground">–</span>
                  <Kbd>9</Kbd>
                </span>
              </td>
              <td className="py-2">
                Select choice (or A–Z when{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
                  shortcuts=&quot;letters&quot;
                </code>
                )
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">
                <span className="inline-flex items-center gap-1">
                  <AskShortcutKbd shortcut="ArrowUp" />
                  <span className="text-muted-foreground">/</span>
                  <AskShortcutKbd shortcut="ArrowDown" />
                </span>
              </td>
              <td className="py-2">Move choice focus</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Navigation shortcuts show as tooltips on Previous / Skip / Next / Submit
        when{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcutTooltips
        </code>{" "}
        is enabled (default). Set{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcuts=&#123;false&#125;
        </code>{" "}
        to disable answer keys and tooltips, or{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcutTooltips=&#123;false&#125;
        </code>{" "}
        to keep bindings without hover hints. Choice keys stay as row badges.
      </p>
    </>
  )
}
