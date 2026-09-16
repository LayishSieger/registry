"use client"

import * as React from "react"
import { ArrowUpIcon, MicIcon, PlusIcon, SquareIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export type ComposerSubmit = {
  text: string
  files?: File[]
}

export type ComposerStatus = "ready" | "submitted" | "streaming" | "error"

/**
 * Enter in the field:
 * - `submit` — Enter sends (default). Shift+Enter inserts a newline.
 * - `focus-send` — first Enter focuses the send button; Enter on send submits.
 */
export type ComposerEnterKeyBehavior = "submit" | "focus-send"

export type ComposerSlotProps = {
  disabled: boolean
  busy: boolean
}

export type ComposerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (message: ComposerSubmit) => void
  /** Map from useChat().status — drives send vs stop */
  status?: ComposerStatus
  onStop?: () => void
  enterKeyBehavior?: ComposerEnterKeyBehavior
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Host-owned purpose mode control (Ask / Plan / Debug, etc.) */
  modeSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  /** Visual mic slot — host wires STT (e.g. SpeechInput in docs) */
  micSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  /** Replace the default + attach control */
  attachSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  accept?: string
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
  /** Enable built-in keyboard shortcuts. Default true. */
  shortcuts?: boolean
}

export const COMPOSER_SHORTCUTS = {
  attach: "Mod+Shift+A",
  mode: "Mod+/",
  dictation: "Mod+Shift+D",
  send: "Mod+Enter",
} as const

const CIRCLE_BTN =
  "size-8 shrink-0 rounded-full p-0 shadow-none [&_svg:not([class*='size-'])]:size-4"

function isBusy(status: ComposerStatus | undefined) {
  return status === "submitted" || status === "streaming"
}

function resolveSlot(
  slot: ComposerProps["modeSlot"],
  props: ComposerSlotProps,
) {
  if (typeof slot === "function") return slot(props)
  return slot
}

function isMod(event: KeyboardEvent | React.KeyboardEvent) {
  return event.metaKey || event.ctrlKey
}

function useModKeyLabel() {
  const [modKey, setModKey] = React.useState<"⌘" | "Ctrl">("Ctrl")

  React.useEffect(() => {
    const apple =
      /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
      /Mac OS|Macintosh/.test(navigator.userAgent)
    setModKey(apple ? "⌘" : "Ctrl")
  }, [])

  return modKey
}

function formatShortcut(shortcut: string, modKey: string) {
  return shortcut
    .split("+")
    .map((part) => (part === "Mod" ? modKey : part))
    .join("+")
}

function DefaultMicButton({ disabled }: { disabled?: boolean }) {
  return (
    <InputGroupButton
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={disabled}
      aria-label="Voice input"
      data-composer-action="dictation"
      className={cn(CIRCLE_BTN, "text-muted-foreground")}
    >
      <MicIcon />
    </InputGroupButton>
  )
}

export function Composer({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  status = "ready",
  onStop,
  enterKeyBehavior = "submit",
  placeholder = "Ask anything…",
  disabled = false,
  className,
  modeSlot,
  micSlot,
  attachSlot,
  accept,
  multiple = true,
  onFilesChange,
  shortcuts = true,
}: ComposerProps) {
  const modKey = useModKeyLabel()
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = valueProp != null
  const value = isControlled ? valueProp : uncontrolledValue
  const [files, setFiles] = React.useState<File[]>([])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const sendButtonRef = React.useRef<HTMLButtonElement>(null)
  const busy = isBusy(status)
  const canSubmit =
    !disabled && !busy && (value.trim().length > 0 || files.length > 0)
  const slotProps: ComposerSlotProps = { disabled: disabled || busy, busy }

  function setValue(next: string) {
    if (!isControlled) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  function setSelectedFiles(next: File[]) {
    setFiles(next)
    onFilesChange?.(next)
  }

  function clearAfterSubmit() {
    setValue("")
    setSelectedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function submit() {
    if (!canSubmit) return
    onSubmit?.({
      text: value.trim(),
      files: files.length > 0 ? files : undefined,
    })
    clearAfterSubmit()
  }

  function handlePrimaryAction() {
    if (busy) {
      onStop?.()
      return
    }
    submit()
  }

  function openFilePicker() {
    if (disabled || busy) return
    fileInputRef.current?.click()
  }

  function activateAction(action: "attach" | "mode" | "dictation" | "send") {
    if (disabled) return
    if (action === "attach") {
      openFilePicker()
      return
    }
    if (action === "send") {
      handlePrimaryAction()
      return
    }
    const root = rootRef.current
    if (!root) return
    const target = root.querySelector<HTMLElement>(
      `[data-composer-action="${action}"]`,
    )
    if (!target) return
    if (target instanceof HTMLButtonElement) {
      target.click()
      return
    }
    target.querySelector("button")?.click()
  }

  function handleEnterKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return

    if (isMod(event) && event.key === "Enter") {
      event.preventDefault()
      if (busy) {
        onStop?.()
        return
      }
      submit()
      return
    }

    if (event.key !== "Enter") return

    if (event.shiftKey) {
      return
    }

    event.preventDefault()

    if (busy) {
      onStop?.()
      return
    }

    if (enterKeyBehavior === "focus-send") {
      sendButtonRef.current?.focus()
      return
    }

    submit()
  }

  React.useEffect(() => {
    if (!shortcuts) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return
      if (!rootRef.current) return
      const active = document.activeElement
      const inside =
        active instanceof Node && rootRef.current.contains(active)
      if (!inside && active !== document.body) return

      const mod = isMod(event)
      if (!mod) return

      if (event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault()
        activateAction("attach")
        return
      }
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        activateAction("dictation")
        return
      }
      if (event.key === "/") {
        event.preventDefault()
        activateAction("mode")
        return
      }
      if (event.key === "Enter") {
        event.preventDefault()
        activateAction("send")
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcuts, disabled, busy, canSubmit, status])

  const resolvedMode = resolveSlot(modeSlot, slotProps)
  const resolvedMic =
    micSlot === undefined ? (
      <DefaultMicButton disabled={slotProps.disabled} />
    ) : (
      resolveSlot(micSlot, slotProps)
    )
  const resolvedAttach =
    attachSlot === undefined ? (
      <InputGroupButton
        type="button"
        size="icon-sm"
        variant="outline"
        disabled={slotProps.disabled}
        aria-label="Attach files"
        data-composer-action="attach"
        title={`Attach (${formatShortcut(COMPOSER_SHORTCUTS.attach, modKey)})`}
        className={cn(
          CIRCLE_BTN,
          "border-border bg-background dark:bg-background",
        )}
        onClick={openFilePicker}
      >
        <PlusIcon />
      </InputGroupButton>
    ) : (
      resolveSlot(attachSlot, slotProps)
    )

  const primaryLabel = busy ? "Stop generating" : "Send message"
  const primaryDisabled = disabled || (!busy && !canSubmit)
  const sendShortcut = formatShortcut(COMPOSER_SHORTCUTS.send, modKey)

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-2">
      {files.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} attached
        </p>
      ) : null}
      <InputGroup
        className={cn(
          "w-full rounded-[1.75rem] border-border/70 bg-muted/40 shadow-none dark:bg-muted/50",
          // Subtle focus — thin soft ring instead of a loud glow
          "has-[[data-slot=input-group-control]:focus-visible]:border-ring/60",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-1",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/25",
          className,
        )}
        data-disabled={disabled || undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          accept={accept}
          multiple={multiple}
          disabled={disabled || busy}
          onChange={(event) => {
            const list = event.currentTarget.files
            setSelectedFiles(list ? Array.from(list) : [])
          }}
        />
        <InputGroupTextarea
          value={value}
          disabled={disabled || busy}
          placeholder={placeholder}
          rows={1}
          aria-keyshortcuts={`Enter ${sendShortcut} Shift+Enter`}
          className="field-sizing-content max-h-48 min-h-12 resize-none px-4 pt-3.5 pb-2 text-sm"
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleEnterKey}
        />
        <InputGroupAddon
          align="block-end"
          className="justify-between gap-2 px-1.5 pb-1.5 pt-0"
        >
          <div className="flex items-center gap-1.5">
            {resolvedAttach}
            <span data-composer-action="mode" className="contents">
              {resolvedMode}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span data-composer-action="dictation" className="contents">
              {resolvedMic}
            </span>
            <InputGroupButton
              ref={sendButtonRef}
              type="button"
              size="icon-sm"
              variant="default"
              disabled={primaryDisabled}
              aria-label={primaryLabel}
              data-composer-action="send"
              title={`${primaryLabel} (${sendShortcut})`}
              className={cn(
                CIRCLE_BTN,
                "bg-foreground text-background hover:bg-foreground/90",
                "disabled:opacity-40",
              )}
              onClick={handlePrimaryAction}
            >
              {busy ? (
                <SquareIcon className="size-3.5 fill-current" />
              ) : (
                <ArrowUpIcon />
              )}
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
