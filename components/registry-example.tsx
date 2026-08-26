import type { ReactNode } from "react"

import { OpenInV0Button } from "@/components/open-in-v0-button"

export function RegistryExample({
  title,
  description,
  name,
  children,
}: {
  title: string
  description: string
  name?: string
  children: ReactNode
}) {
  return (
    <section className="relative flex min-h-[450px] flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1 sm:pl-3">
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {name ? <OpenInV0Button name={name} className="w-fit shrink-0" /> : null}
      </div>
      <div className="relative flex min-h-[400px] w-full items-center justify-center">
        {children}
      </div>
    </section>
  )
}
