import { DocsSidebar } from "@/components/docs-sidebar"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 px-4 md:px-6">
      <DocsSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
