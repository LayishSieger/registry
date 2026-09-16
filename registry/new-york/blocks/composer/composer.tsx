"use client"

import * as React from "react"
import { ArrowUpIcon, MicIcon, PlusIcon, SquareIcon } from "lucide-react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

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
 * - `auto` — start compact; expand on wrap, Shift+Enter, or narrow width.
 *   Collapses back to compact only when the field is cleared (or after submit).
 * - `compact` — prefer one-line; expands on newline or narrow width.
 * - `expanded` — always multi-line.
 */
export type ComposerForm = "auto" | "compact" | "expanded"

export type ComposerEnterKeyBehavior = "submit" | "focus-send"

/** Spring used for compact ↔ expanded morph. Tunable via DialKit in docs. */
export type ComposerMotion = {
  visualDuration?: number
  bounce?: number
}

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
  status?: ComposerStatus
  onStop?: () => void
  form?: ComposerForm
  enterKeyBehavior?: ComposerEnterKeyBehavior
  placeholder?: string
  disabled?: boolean
  className?: string
  modeSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  micSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  attachSlot?: React.ReactNode | ((props: ComposerSlotProps) => React.ReactNode)
  accept?: string
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
  /** Below this width (px), force expanded. Default 360. */
  minWidth?: number
  /** Compact ↔ expanded spring. Defaults match Emil-style short UI motion. */
  motionConfig?: ComposerMotion
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

const DEFAULT_MOTION: Required<ComposerMotion> = {
  visualDuration: 0.22,
  bounce: 0.08,
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

function isMod(event: KeyboardEvent | React.KeyboardEvent) {
  return event.metaKey || event.ctrlKey
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
  const prevWhiteSpace = textarea.style.whiteSpace
  const prevHeight = textarea.style.height
  textarea.style.whiteSpace = "pre-wrap"
  textarea.style.height = "auto"
  const scrollHeight = textarea.scrollHeight
  textarea.style.whiteSpace = prevWhiteSpace
  textarea.style.height = prevHeight
  return scrollHeight > singleLine + 1
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
  minWidth = 360,
  motionConfig,
  shortcuts = true,
}: ComposerProps) {
  const reduceMotion = useReducedMotion()
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = valueProp != null
  const value = isControlled ? valueProp : uncontrolledValue
  const [files, setFiles] = React.useState<File[]>([])
  /** Sticky expand until cleared — avoids collapse flicker at the wrap edge. */
  const [latchedExpanded, setLatchedExpanded] = React.useState(
    () => value.trim().length > 0 && value.includes("\n"),
  )
  const [narrow, setNarrow] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const sendButtonRef = React.useRef<HTMLButtonElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const busy = isBusy(status)
  const canSubmit =
    !disabled && !busy && (value.trim().length > 0 || files.length > 0)

  const spring = {
    type: "spring" as const,
    visualDuration: motionConfig?.visualDuration ?? DEFAULT_MOTION.visualDuration,
    bounce: motionConfig?.bounce ?? DEFAULT_MOTION.bounce,
  }

  const layoutTransition = reduceMotion
    ? { duration: 0 }
    : spring

  const shouldExpand =
    form === "expanded" ||
    narrow ||
    (form === "auto" && latchedExpanded) ||
    (form === "compact" && value.includes("\n"))

  const visualForm: "compact" | "expanded" = shouldExpand
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
    setLatchedExpanded(false)
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

  function latchExpandFromContent(nextValue: string) {
    if (form === "expanded") return
    if (nextValue.trim().length === 0) {
      setLatchedExpanded(false)
      return
    }
    if (nextValue.includes("\n")) {
      setLatchedExpanded(true)
      return
    }
    if (form === "auto" && !latchedExpanded) {
      requestAnimationFrame(() => {
        if (measureNeedsExpand(textareaRef.current)) {
          setLatchedExpanded(true)
        }
      })
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.currentTarget.value
    setValue(next)
    latchExpandFromContent(next)
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
      if (form === "auto" || form === "compact") {
        setLatchedExpanded(true)
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

  React.useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setNarrow(width > 0 && width < minWidth)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [minWidth])

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
        title={`Attach (${COMPOSER_SHORTCUTS.attach})`}
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
  const isExpanded = visualForm === "expanded"

  const primaryButton = (
    <InputGroupButton
      ref={sendButtonRef}
      type="button"
      size="icon-sm"
      variant="default"
      disabled={primaryDisabled}
      aria-label={primaryLabel}
      data-composer-action="send"
      title={`${primaryLabel} (${COMPOSER_SHORTCUTS.send})`}
      className={cn(
        CIRCLE_BTN,
        "bg-foreground text-background hover:bg-foreground/90",
        "disabled:opacity-40",
      )}
      onClick={handlePrimaryAction}
    >
      {busy ? <SquareIcon className="size-3.5 fill-current" /> : <ArrowUpIcon />}
    </InputGroupButton>
  )

  const leadingControls = (
    <motion.div layout className="flex items-center gap-1.5" transition={layoutTransition}>
      {resolvedAttach}
      <span data-composer-action="mode" className="contents">
        {resolvedMode}
      </span>
    </motion.div>
  )

  const trailingControls = (
    <motion.div layout className="flex items-center gap-1.5" transition={layoutTransition}>
      <span data-composer-action="dictation" className="contents">
        {resolvedMic}
      </span>
      {primaryButton}
    </motion.div>
  )

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-2">
      {files.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} attached
        </p>
      ) : null}
      <LayoutGroup id="composer-layout">
        <motion.div
          layout
          transition={layoutTransition}
          className="w-full"
          style={{
            borderRadius: isExpanded ? 28 : 9999,
          }}
        >
          <InputGroup
            className={cn(
              "w-full overflow-hidden border-border/70 bg-muted/40 shadow-none dark:bg-muted/50",
              // Inherit animated radius from the motion wrapper
              "rounded-[inherit]",
              // Subtle focus — thin soft ring instead of a loud glow
              "has-[[data-slot=input-group-control]:focus-visible]:border-ring/60",
              "has-[[data-slot=input-group-control]:focus-visible]:ring-1",
              "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/25",
              isExpanded ? "min-h-0" : "min-h-12",
              className,
            )}
            data-disabled={disabled || undefined}
            data-form={visualForm}
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
              ref={textareaRef}
              value={value}
              disabled={disabled || busy}
              placeholder={placeholder}
              rows={1}
              aria-keyshortcuts="Enter Mod+Enter Shift+Enter"
              className={cn(
                "field-sizing-content max-h-48 px-2 text-sm",
                "transition-[padding,min-height] ease-[cubic-bezier(0.77,0,0.175,1)]",
                reduceMotion ? "duration-0" : "duration-200",
                isExpanded
                  ? "min-h-12 resize-none px-4 pt-3.5 pb-2 whitespace-pre-wrap"
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
        </motion.div>
      </LayoutGroup>
    </div>
  )
}
