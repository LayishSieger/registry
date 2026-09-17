"use client"

import { AskDefaultPreview } from "@/components/ask-preview"
import { InteractiveFocusSurface } from "@/registry/new-york/blocks/ask/ask"

/** Home Ask demo: preview chrome arms interactive focus like docs. */
export function AskHomePreview() {
  return (
    <InteractiveFocusSurface className="flex min-h-[400px] w-full items-center justify-center rounded-lg border bg-background p-6">
      <AskDefaultPreview />
    </InteractiveFocusSurface>
  )
}
