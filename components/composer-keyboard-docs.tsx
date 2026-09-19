"use client"

import { ShortcutKbd } from "@/components/shortcut-kbd"
import { Kbd } from "@/components/ui/kbd"
import {
  ComposerShortcutKbd,
  COMPOSER_SHORTCUTS,
} from "@/registry/new-york/blocks/composer/composer"
import { useModKey } from "@/hooks/use-mod-key"

const ROWS = [
  { shortcut: COMPOSER_SHORTCUTS.attach, action: "Attach" },
  { shortcut: COMPOSER_SHORTCUTS.mode, action: "Cycle mode + expand chips" },
  { shortcut: COMPOSER_SHORTCUTS.dictation, action: "Dictation / mic" },
] as const

export function ComposerKeyboardDocs() {
  const modKey = useModKey()

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
                <span className="inline-flex items-center gap-1">
                  <ComposerShortcutKbd shortcut="Enter" modKey={modKey} />
                  <span className="text-muted-foreground">/</span>
                  <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.send} />
                </span>
              </td>
              <td className="py-2">Send (or stop when busy)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">
                <ComposerShortcutKbd
                  shortcut="Shift+Enter"
                  modKey={modKey}
                />
              </td>
              <td className="py-2">Newline</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        On desktop (fine pointer), modifier is <Kbd>⌘</Kbd> on macOS and{" "}
        <Kbd>Ctrl</Kbd> elsewhere — both currently match as Mod. Shortcuts only
        run while focus is inside the composer. On touch / coarse pointers, Mod
        shortcuts and Kbd tooltips are off and Enter inserts a newline — send
        with the button. Tooltips dismiss on click.
      </p>
      <p className="text-sm text-muted-foreground">
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcuts=&#123;false&#125;
        </code>{" "}
        turns off Mod action bindings (attach / mode / dictation) and tooltips.
        It does <span className="text-foreground">not</span> disable field Enter
        behavior:{" "}
        <ComposerShortcutKbd shortcut="Shift+Enter" modKey={modKey} /> still
        inserts a newline, and{" "}
        <ComposerShortcutKbd shortcut="Enter" modKey={modKey} /> /{" "}
        <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.send} /> still send or stop
        while busy (on fine pointers). Set{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8rem]">
          shortcutTooltips=&#123;false&#125;
        </code>{" "}
        to keep Mod bindings without hover hints.
      </p>
    </>
  )
}
