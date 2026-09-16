"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroupButton } from "@/components/ui/input-group"
import type {
  ComposerStatus,
  ComposerSubmit,
} from "@/registry/new-york/blocks/composer/composer"
import { Composer } from "@/registry/new-york/blocks/composer/composer"

const MODES = [
  { value: "ask", label: "Ask" },
  { value: "plan", label: "Plan" },
  { value: "debug", label: "Debug" },
  { value: "auto", label: "Auto" },
] as const

function ModeSelect({
  value,
  onValueChange,
  disabled,
}: {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}) {
  const label = MODES.find((mode) => mode.value === value)?.label ?? value

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <InputGroupButton
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          className="gap-1 rounded-full px-2 text-muted-foreground"
        >
          {label}
          <ChevronDownIcon className="size-3.5 opacity-70" />
        </InputGroupButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {MODES.map((mode) => (
            <DropdownMenuRadioItem key={mode.value} value={mode.value}>
              {mode.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PreviewShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  )
}

function useComposerDemo() {
  const [text, setText] = React.useState("")
  const [mode, setMode] = React.useState("auto")
  const [status, setStatus] = React.useState<ComposerStatus>("ready")
  const [last, setLast] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleSubmit(message: ComposerSubmit) {
    const files =
      message.files && message.files.length > 0
        ? ` · ${message.files.length} file${message.files.length === 1 ? "" : "s"}`
        : ""
    setLast(`[${mode}] ${message.text || "(files only)"}${files}`)
    setStatus("submitted")
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setStatus("streaming")
      timeoutRef.current = setTimeout(() => {
        setStatus("ready")
        timeoutRef.current = null
      }, 1320)
    }, 280)
  }

  function handleStop() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setStatus("ready")
    setLast((current) => (current ? `${current} · stopped` : "stopped"))
  }

  return {
    text,
    setText,
    mode,
    setMode,
    status,
    last,
    handleSubmit,
    handleStop,
  }
}

export function ComposerCompactPreview() {
  const demo = useComposerDemo()

  return (
    <PreviewShell title="Compact">
      <Composer
        form="compact"
        value={demo.text}
        onValueChange={demo.setText}
        status={demo.status}
        onStop={demo.handleStop}
        onSubmit={demo.handleSubmit}
        placeholder="i want to add a composer component. it should have two forms. one line"
        modeSlot={({ disabled }) => (
          <ModeSelect
            value={demo.mode}
            onValueChange={demo.setMode}
            disabled={disabled}
          />
        )}
      />
      {demo.last ? (
        <p className="text-sm text-muted-foreground">{demo.last}</p>
      ) : null}
    </PreviewShell>
  )
}

export function ComposerExpandedPreview() {
  const demo = useComposerDemo()

  return (
    <PreviewShell title="Expanded">
      <Composer
        form="expanded"
        value={demo.text}
        onValueChange={demo.setText}
        status={demo.status}
        onStop={demo.handleStop}
        onSubmit={demo.handleSubmit}
        placeholder="Write a longer prompt. Shift+Enter for a new line."
        modeSlot={({ disabled }) => (
          <ModeSelect
            value={demo.mode}
            onValueChange={demo.setMode}
            disabled={disabled}
          />
        )}
      />
      {demo.last ? (
        <p className="text-sm text-muted-foreground">{demo.last}</p>
      ) : null}
    </PreviewShell>
  )
}

export function ComposerFocusSendPreview() {
  const demo = useComposerDemo()

  return (
    <PreviewShell title="Enter focuses send">
      <Composer
        form="compact"
        enterKeyBehavior="focus-send"
        value={demo.text}
        onValueChange={demo.setText}
        status={demo.status}
        onStop={demo.handleStop}
        onSubmit={demo.handleSubmit}
        placeholder="Press Enter to focus Send, Enter again to submit"
        modeSlot={({ disabled }) => (
          <ModeSelect
            value={demo.mode}
            onValueChange={demo.setMode}
            disabled={disabled}
          />
        )}
      />
      {demo.last ? (
        <p className="text-sm text-muted-foreground">{demo.last}</p>
      ) : null}
    </PreviewShell>
  )
}

export function ComposerUseChatPreview() {
  const [text, setText] = React.useState("")
  const [status, setStatus] = React.useState<ComposerStatus>("ready")
  const [log, setLog] = React.useState<string[]>([])
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Composer
        form="compact"
        value={text}
        onValueChange={setText}
        status={status}
        onStop={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          setStatus("ready")
          setLog((current) => [...current, "stop()"])
        }}
        onSubmit={({ text: next, files }) => {
          setLog((current) => [
            ...current,
            `sendMessage({ text: ${JSON.stringify(next)}${
              files?.length ? `, files: [${files.length}]` : ""
            } })`,
          ])
          setStatus("submitted")
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => {
            setStatus("streaming")
            timeoutRef.current = setTimeout(() => {
              setStatus("ready")
              timeoutRef.current = null
            }, 1200)
          }, 200)
        }}
        modeSlot={
          <span className="px-2 text-sm text-muted-foreground">Ask</span>
        }
      />
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
        {log.length > 0
          ? log.join("\n")
          : "// Wired like useChat — submit → sendMessage, busy → stop()"}
      </pre>
      {log.length > 0 ? (
        <Button type="button" variant="outline" onClick={() => setLog([])}>
          Clear log
        </Button>
      ) : null}
    </div>
  )
}
