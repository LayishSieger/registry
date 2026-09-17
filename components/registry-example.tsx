"use client"

import type { ReactNode } from "react"

import { OpenInV0Button } from "@/components/open-in-v0-button"
import { InteractiveFocusSurface } from "@/registry/new-york/blocks/ask/ask"

export function RegistryExample({
  title,
  description,
  name,
  children,
  interactiveFocus = false,
}: {
  title?: string
  description?: string
  name?: string
  children: ReactNode
  /** Mark the preview chrome as an interactive focus surface (needs a parent provider). */
  interactiveFocus?: boolean
}) {
  const hasHeader = Boolean(title || description || name)

  const frameClassName =
    "relative flex min-h-[400px] w-full items-center justify-center rounded-lg border bg-background p-6"

  return (
    <section className="relative flex min-h-[450px] flex-col gap-4">
      {hasHeader ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1 sm:pl-3">
            {title ? <h2 className="text-sm font-medium">{title}</h2> : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {name ? (
            <OpenInV0Button name={name} className="w-fit shrink-0" />
          ) : null}
        </div>
      ) : null}
      {interactiveFocus ? (
        <InteractiveFocusSurface className={frameClassName}>
          {children}
        </InteractiveFocusSurface>
      ) : (
        <div className={frameClassName}>{children}</div>
      )}
    </section>
  )
}
