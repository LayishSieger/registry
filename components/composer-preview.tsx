"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { SpeechInput } from "@/components/ai-elements/speech-input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShortcutKbd, useShortcutLabel } from "@/components/shortcut-kbd"
import { InputGroupButton } from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import type {
  ComposerStatus,
  ComposerSubmit,
} from "@/registry/new-york/blocks/composer/composer"
import {
  COMPOSER_SHORTCUTS,
  Composer,
} from "@/registry/new-york/blocks/composer/composer"

const MODES = [
  {
    value: "ask",
    label: "Ask",
    className:
      "bg-sky-500/15 text-sky-800 hover:bg-sky-500/20 dark:text-sky-200",
  },
  {
    value: "plan",
    label: "Plan",
    className:
      "bg-violet-500/15 text-violet-800 hover:bg-violet-500/20 dark:text-violet-200",
  },
  {
    value: "debug",
    label: "Debug",
    className:
      "bg-amber-500/15 text-amber-900 hover:bg-amber-500/20 dark:text-amber-200",
  },
  {
    value: "auto",
    label: "Auto",
    className:
      "bg-emerald-500/15 text-emerald-900 hover:bg-emerald-500/20 dark:text-emerald-200",
  },
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
  const mode = MODES.find((entry) => entry.value === value) ?? MODES[3]
  const modeShortcut = useShortcutLabel(COMPOSER_SHORTCUTS.mode)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <InputGroupButton
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          data-composer-action="mode"
          title={`Change mode (${modeShortcut})`}
          className={cn(
            "h-8 gap-1 rounded-full border-0 px-2.5 text-xs font-medium shadow-none",
            mode.className,
          )}
        >
          {mode.label}
          <ChevronDownIcon className="size-3.5 opacity-70" />
        </InputGroupButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {MODES.map((entry) => (
            <DropdownMenuRadioItem key={entry.value} value={entry.value}>
              <span
                className={cn(
                  "mr-2 inline-flex size-2.5 rounded-full",
                  entry.value === "ask" && "bg-sky-500",
                  entry.value === "plan" && "bg-violet-500",
                  entry.value === "debug" && "bg-amber-500",
                  entry.value === "auto" && "bg-emerald-500",
                )}
              />
              {entry.label}
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

function useComposerDemo(initialMode = "auto") {
  const [text, setText] = React.useState("")
  const [mode, setMode] = React.useState(initialMode)
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

const DEFAULT_PLACEHOLDER = "Ask anything…"

export function ComposerDefaultPreview() {
  const demo = useComposerDemo()

  return (
    <PreviewShell title="Composer">
      <Composer
        value={demo.text}
        onValueChange={demo.setText}
        status={demo.status}
        onStop={demo.handleStop}
        onSubmit={demo.handleSubmit}
        placeholder={DEFAULT_PLACEHOLDER}
        modeSlot={({ disabled }) => (
          <ModeSelect
            value={demo.mode}
            onValueChange={demo.setMode}
            disabled={disabled}
          />
        )}
      />
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Kbd>Enter</Kbd>
          <span>sends</span>
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <KbdGroup>
            <Kbd>Shift</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
          <span>newline</span>
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.attach} />
          <span>attach</span>
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.mode} />
          <span>mode</span>
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.dictation} />
          <span>voice</span>
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <ShortcutKbd shortcut={COMPOSER_SHORTCUTS.send} />
          <span>send</span>
        </span>
      </p>
      {demo.last ? (
        <p className="text-sm text-muted-foreground">{demo.last}</p>
      ) : null}
    </PreviewShell>
  )
}

export function ComposerFocusSendPreview() {
  const demo = useComposerDemo("ask")

  return (
    <PreviewShell title="Enter focuses send">
      <Composer
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

function appendTranscript(current: string, transcript: string) {
  const next = transcript.trim()
  if (!next) return current
  const base = current.trim()
  return base ? `${base} ${next}` : next
}

export function ComposerSpeechInputPreview() {
  const demo = useComposerDemo("debug")
  const textRef = React.useRef(demo.text)
  textRef.current = demo.text

  return (
    <PreviewShell title="SpeechInput in micSlot">
      <Composer
        value={demo.text}
        onValueChange={demo.setText}
        status={demo.status}
        onStop={demo.handleStop}
        onSubmit={demo.handleSubmit}
        placeholder={DEFAULT_PLACEHOLDER}
        modeSlot={({ disabled }) => (
          <ModeSelect
            value={demo.mode}
            onValueChange={demo.setMode}
            disabled={disabled}
          />
        )}
        micSlot={({ disabled }) => (
          <SpeechInput
            size="icon-sm"
            variant="ghost"
            disabled={disabled}
            aria-label="Voice input"
            onTranscriptionChange={(transcript) => {
              demo.setText(appendTranscript(textRef.current, transcript))
            }}
          />
        )}
      />
      <p className="text-xs text-muted-foreground">
        Uses the browser Web Speech API in Chrome/Edge — free, no API keys or
        tokens from Layish. Optional Whisper via{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono">
          onAudioRecorded
        </code>{" "}
        is host-paid if you add it.
      </p>
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
          <span className="inline-flex h-8 items-center rounded-full bg-sky-500/15 px-2.5 text-xs font-medium text-sky-800 dark:text-sky-200">
            Ask
          </span>
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
