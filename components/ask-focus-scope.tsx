"use client"

import type { ReactNode } from "react"

import { InteractiveFocusProvider } from "@/registry/new-york/blocks/ask/ask"

export function AskFocusScope({ children }: { children: ReactNode }) {
  return <InteractiveFocusProvider>{children}</InteractiveFocusProvider>
}
