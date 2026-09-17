"use client"

import type { ReactNode } from "react"

import { InteractiveFocusProvider } from "@/registry/new-york/blocks/ask/ask"

/** Single focus scope for all Ask demos on the docs page. */
export function AskFocusScope({ children }: { children: ReactNode }) {
  return <InteractiveFocusProvider>{children}</InteractiveFocusProvider>
}
