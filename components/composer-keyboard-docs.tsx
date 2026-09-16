"use client"

import { ShortcutKbd } from "@/components/shortcut-kbd"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { COMPOSER_SHORTCUTS } from "@/registry/new-york/blocks/composer/composer"

const ROWS = [
  { shortcut: COMPOSER_SHORTCUTS.attach, action: "Attach" },
  { shortcut: COMPOSER_SHORTCUTS.mode, action: "Mode" },
  { shortcut: COMPOSER_SHORTCUTS.dictation, action: "Dictation / mic" },
] as const

export function ComposerKeyboardDocs() {
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
              <tr key={row.shortcut} className="border-b">
                <td className="py-2 pr-4 text-foreground">
                  <ShortcutKbd shortcut={row.shortcut} />
                </td>
                <td className="py-2">{row.action}</td>
              </tr>
            ))}
            <tr className="border-b">
              <td className="py-2 pr-4 text-foreground">
                <KbdGroup>
                  <Kbd>Enter</Kbd>
                  <span className="text-muted-foreground">/</span>
                  <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.send} />
                </KbdGroup>
              </td>
              <td className="py-2">Send (or stop when busy)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">
                <KbdGroup>
                  <Kbd>Shift</Kbd>
                  <Kbd>Enter</Kbd>
                </KbdGroup>
              </td>
              <td className="py-2">Newline</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Modifier is <Kbd>⌘</Kbd> on macOS and <Kbd>Ctrl</Kbd> elsewhere. Set{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcuts=&#123;false&#125;
        </code>{" "}
        to disable.
      </p>
    </>
  )
}
