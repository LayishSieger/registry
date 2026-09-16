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
 * - `auto` — start compact; expand when text wraps or Shift+Enter inserts a newline
 * - `compact` — stay one-line (Enter sends; Shift+Enter expands via newline)
 * - `expanded` — always multi-line (Shift+Enter = newline)
 */
export type ComposerForm = "auto" | "compact" | "expanded"

/**
 * Enter in the field:
 * - `submit` — Enter sends (default). Shift+Enter inserts a newline (and expands in auto).
 * - `focus-send` — first Enter focuses the send button; Enter on send submits.
 */
export type ComposerEnterKeyBehavior = "submit" | "focus-send"

export type ComposerSlotProps = {
  disabled: boolean
  busy: boolean
  form: "compact" | "expanded"
}

export type ComposerProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (message: ComposerSubmit) => void
  /** Map from useChat().status — drives send vs stop */
  status?: ComposerStatus
  onStop?: () => void
  /** Visual / layout mode. Default `auto`. */
  form?: ComposerForm
  enterKeyBehavior?: ComposerEnterKeyBehavior
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Host-owned purpose mode control (Ask / Plan / Debug, etc.) */
  modeSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  /** Visual mic slot only in v1 — host wires STT */
  micSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  /** Replace the default + attach control */
  attachSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  accept?: string
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
}

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

function DefaultMicButton({ disabled }: { disabled?: boolean }) {
  return (
    <InputGroupButton
      type="button"
      size="icon-sm"
      variant="ghost"
      disabled={disabled}
      aria-label="Voice input"
      className={cn(CIRCLE_BTN, "text-muted-foreground")}
    >
      <MicIcon />
    </InputGroupButton>
  )
}

function measureNeedsExpand(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return false
  if (textarea.value.includes("\n")) return true
  const styles = window.getComputedStyle(textarea)
  const lineHeight = Number.parseFloat(styles.lineHeight) || 20
  const paddingY =
    Number.parseFloat(styles.paddingTop) +
    Number.parseFloat(styles.paddingBottom)
  const singleLine = lineHeight + paddingY
  // Temporarily allow wrap to measure natural height
  const prevWhiteSpace = textarea.style.whiteSpace
  const prevHeight = textarea.style.height
  textarea.style.whiteSpace = "pre-wrap"
  textarea.style.height = "auto"
  const scrollHeight = textarea.scrollHeight
  textarea.style.whiteSpace = prevWhiteSpace
  textarea.style.height = prevHeight
  return scrollHeight > singleLine + 1
}

export function Composer({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  status = "ready",
  onStop,
  form = "auto",
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
}: ComposerProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = valueProp != null
  const value = isControlled ? valueProp : uncontrolledValue
  const [files, setFiles] = React.useState<File[]>([])
  const [autoExpanded, setAutoExpanded] = React.useState(
    () => value.includes("\n"),
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const sendButtonRef = React.useRef<HTMLButtonElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const busy = isBusy(status)
  const canSubmit =
    !disabled && !busy && (value.trim().length > 0 || files.length > 0)

  const visualForm: "compact" | "expanded" =
    form === "expanded"
      ? "expanded"
      : form === "compact"
        ? value.includes("\n")
          ? "expanded"
          : "compact"
        : autoExpanded || value.includes("\n")
          ? "expanded"
          : "compact"

  const slotProps: ComposerSlotProps = {
    disabled: disabled || busy,
    busy,
    form: visualForm,
  }

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
    setAutoExpanded(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function submit() {
    if (!canSubmit) return
    const text = value.trim()
    onSubmit?.({
      text,
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

  function syncAutoExpand(nextValue: string) {
    if (form !== "auto" && form !== "compact") return
    if (nextValue.includes("\n")) {
      setAutoExpanded(true)
      return
    }
    // Defer measure until after React paints the new value
    requestAnimationFrame(() => {
      const needs = measureNeedsExpand(textareaRef.current)
      setAutoExpanded(needs)
    })
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.currentTarget.value
    setValue(next)
    syncAutoExpand(next)
  }

  function handleEnterKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return
    if (event.key !== "Enter") return

    if (event.shiftKey) {
      // Allow newline; auto/compact will expand
      if (form === "auto" || form === "compact") {
        setAutoExpanded(true)
      }
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

  function openFilePicker() {
    if (disabled || busy) return
    fileInputRef.current?.click()
  }

  React.useLayoutEffect(() => {
    if (form !== "auto") return
    if (!value) {
      setAutoExpanded(false)
      return
    }
    setAutoExpanded(measureNeedsExpand(textareaRef.current) || value.includes("\n"))
  }, [form, value])

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

  const primaryButton = (
    <InputGroupButton
      ref={sendButtonRef}
      type="button"
      size="icon-sm"
      variant="default"
      disabled={primaryDisabled}
      aria-label={primaryLabel}
      className={cn(
        CIRCLE_BTN,
        "bg-foreground text-background hover:bg-foreground/90",
        "disabled:opacity-40",
      )}
      onClick={handlePrimaryAction}
      onKeyDown={(event) => {
        if (event.key !== "Enter" || event.nativeEvent.isComposing) return
        if (busy) return
        event.preventDefault()
        submit()
      }}
    >
      {busy ? <SquareIcon className="size-3.5 fill-current" /> : <ArrowUpIcon />}
    </InputGroupButton>
  )

  const fileInput = (
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
  )

  const isExpanded = visualForm === "expanded"

  const shellClass = cn(
    "w-full border-border/70 bg-muted/40 shadow-none transition-[border-radius,background-color] duration-200 dark:bg-muted/50",
    isExpanded ? "rounded-[1.75rem]" : "min-h-12 rounded-full",
    className,
  )

  const leadingControls = (
    <div className="flex items-center gap-1.5">
      {resolvedAttach}
      {resolvedMode}
    </div>
  )

  const trailingControls = (
    <div className="flex items-center gap-1.5">
      {resolvedMic}
      {primaryButton}
    </div>
  )

  return (
    <div className="flex w-full flex-col gap-2">
      {files.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} attached
        </p>
      ) : null}
      <InputGroup
        className={shellClass}
        data-disabled={disabled || undefined}
        data-form={visualForm}
      >
        {fileInput}
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          disabled={disabled || busy}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "field-sizing-content max-h-48 px-2 text-sm transition-[padding,min-height] duration-200",
            isExpanded
              ? "min-h-12 resize-none px-4 pt-3.5 pb-2"
              : "min-h-10 max-h-10 resize-none overflow-hidden whitespace-nowrap py-2.5 leading-5",
          )}
          onChange={handleChange}
          onKeyDown={handleEnterKey}
        />
        {isExpanded ? (
          <InputGroupAddon
            align="block-end"
            className="justify-between gap-2 px-1.5 pb-1.5 pt-0"
          >
            {leadingControls}
            <div className="ml-auto">{trailingControls}</div>
          </InputGroupAddon>
        ) : (
          <>
            <InputGroupAddon
              align="inline-start"
              className="gap-1.5 py-0 pl-1.5 pr-0"
            >
              {leadingControls}
            </InputGroupAddon>
            <InputGroupAddon
              align="inline-end"
              className="gap-1.5 py-0 pr-1.5 pl-0"
            >
              {trailingControls}
            </InputGroupAddon>
          </>
        )}
      </InputGroup>
    </div>
  )
}
