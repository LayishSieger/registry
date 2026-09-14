"use client"

import * as React from "react"

export function useCopyToClipboard({
  timeout = 2000,
}: {
  timeout?: number
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = React.useCallback(
    async (value: string) => {
      if (!value) return false

      try {
        await navigator.clipboard.writeText(value)
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), timeout)
        return true
      } catch {
        setIsCopied(false)
        return false
      }
    },
    [timeout],
  )

  return { isCopied, copyToClipboard }
}
