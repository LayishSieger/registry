"use client"

import { AskDefaultPreview } from "@/components/ask-preview"
import { InteractiveFocusSurface } from "@/registry/new-york/blocks/ask/ask"

export function AskHomePreview() {
  return (
    <InteractiveFocusSurface className="flex min-h-[400px] w-full items-center justify-center rounded-lg border bg-background p-6">
      <AskDefaultPreview />
    </InteractiveFocusSurface>
  )
}
