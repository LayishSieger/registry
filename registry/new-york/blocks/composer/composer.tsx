"use client"

import * as React from "react"
import { ArrowUpIcon, MicIcon, PlusIcon, SquareIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export type ComposerSubmit = {
  text: string
  files?: File[]
}

export type ComposerStatus = "ready" | "submitted" | "streaming" | "error"

export type ComposerForm = "compact" | "expanded"

/**
 * Enter in the field:
 * - `submit` — Enter sends (default). Expanded still uses Shift+Enter for newline.
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
      className="rounded-full text-muted-foreground"
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
  form = "compact",
  enterKeyBehavior = "submit",
  placeholder = "Message…",
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

  function handleEnterKey(
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (event.nativeEvent.isComposing) return
    if (event.key !== "Enter") return

    if (form === "expanded" && event.shiftKey) {
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
        className="rounded-full border-border bg-background shadow-none dark:bg-background"
        onClick={openFilePicker}
      >
        <PlusIcon />
      </InputGroupButton>
    ) : (
      resolveSlot(attachSlot, slotProps)
    )

  const primaryLabel = busy ? "Stop generating" : "Send message"
  const primaryDisabled = disabled || (!busy && !canSubmit)

  const shellClass = cn(
    "w-full border-border/70 bg-muted/40 shadow-none dark:bg-muted/50",
    form === "compact" ? "h-12 rounded-full" : "rounded-[1.75rem]",
    className,
  )

  const primaryButton = (
    <InputGroupButton
      ref={sendButtonRef}
      type="button"
      size="icon-sm"
      variant="default"
      disabled={primaryDisabled}
      aria-label={primaryLabel}
      className={cn(
        "rounded-full bg-foreground text-background hover:bg-foreground/90",
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

  const trailingControls = (
    <>
      {resolvedMode}
      {resolvedMic}
      {primaryButton}
    </>
  )

  if (form === "expanded") {
    return (
      <div className="flex w-full flex-col gap-2">
        {files.length > 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            {files.length} file{files.length === 1 ? "" : "s"} attached
          </p>
        ) : null}
        <InputGroup className={shellClass} data-disabled={disabled || undefined}>
          {fileInput}
          <InputGroupTextarea
            value={value}
            disabled={disabled || busy}
            placeholder={placeholder}
            rows={1}
            className="min-h-12 field-sizing-content max-h-48 px-4 py-3.5 text-sm"
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={handleEnterKey}
          />
          <InputGroupAddon
            align="block-end"
            className="justify-between gap-2 px-3 pb-3"
          >
            <div className="flex items-center gap-1.5">{resolvedAttach}</div>
            <div className="ml-auto flex items-center gap-1.5">
              {trailingControls}
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {files.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} attached
        </p>
      ) : null}
      <InputGroup className={shellClass} data-disabled={disabled || undefined}>
        {fileInput}
        <InputGroupInput
          value={value}
          disabled={disabled || busy}
          placeholder={placeholder}
          className="h-12 px-2 text-sm"
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleEnterKey}
        />
        <InputGroupAddon align="inline-start" className="pl-2">
          {resolvedAttach}
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="gap-1.5 pr-2">
          {trailingControls}
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
