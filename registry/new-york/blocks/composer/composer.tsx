"use client"

import * as React from "react"
import {
  ArrowBigUpIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  MicIcon,
  PlusIcon,
  SquareIcon,
} from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ComposerSubmit = {
  text: string
  files?: File[]
}

export type ComposerStatus = "ready" | "submitted" | "streaming" | "error"

/**
 * Enter in the field (fine pointer / keyboard only):
 * - `submit` — Enter sends (default). Shift+Enter inserts a newline.
 * - `focus-send` — first Enter focuses the send button; Enter on send submits.
 *   After submit, focus returns to the field so Enter cannot immediately stop.
 * Touch / coarse pointers: Enter always inserts a newline; send via the button.
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
  /** Enable Mod action shortcuts (attach / mode / dictation). Default true. Field Enter / Shift+Enter / Mod+Enter send behavior is separate. */
  shortcuts?: boolean
  /**
   * Show Kbd shortcut tooltips on attach / mode / mic / send.
   * Default true. Only applies when `shortcuts` is also enabled —
   * set `shortcutTooltips={false}` to keep bindings without hover hints.
   */
  shortcutTooltips?: boolean
}

export const COMPOSER_SHORTCUTS = {
  attach: "Mod+Shift+A",
  mode: "Mod+Shift+O",
  dictation: "Mod+Shift+D",
  send: "Mod+Enter",
} as const

/** Dispatched on the composer root for Mod+Shift+O — mode slots should cycle + expand. */
export const COMPOSER_MODE_SHORTCUT_EVENT = "composer:mode-shortcut"

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

function readModKey(): "⌘" | "Ctrl" {
  const apple =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
    /Mac OS|Macintosh/.test(navigator.userAgent)
  return apple ? "⌘" : "Ctrl"
}

function useModKey() {
  return React.useSyncExternalStore(
    () => () => {},
    readModKey,
    () => "Ctrl" as const,
  )
}

/** True for mouse/trackpad hover devices — false on touch / coarse pointers. */
function useFinePointerHover() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
      mq.addEventListener("change", onStoreChange)
      return () => mq.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false,
  )
}

function formatShortcutLabel(shortcut: string, modKey: string) {
  return shortcut
    .split("+")
    .map((part) => (part === "Mod" ? modKey : part))
    .join("+")
}

function ShortcutKey({ part }: { part: string }) {
  if (part === "Shift") {
    return (
      <Kbd>
        <ArrowBigUpIcon aria-label="Shift" />
      </Kbd>
    )
  }
  if (part === "Enter") {
    return (
      <Kbd>
        <CornerDownLeftIcon aria-label="Enter" />
      </Kbd>
    )
  }
  return <Kbd>{part}</Kbd>
}

export function ComposerShortcutKbd({
  shortcut,
  modKey,
  className,
}: {
  shortcut: string
  modKey: string
  className?: string
}) {
  const parts = shortcut
    .split("+")
    .map((part) => (part === "Mod" ? modKey : part))

  return (
    <KbdGroup className={cn("align-middle", className)}>
      {parts.map((part, index) => (
        <ShortcutKey key={`${shortcut}-${index}-${part}`} part={part} />
      ))}
    </KbdGroup>
  )
}

function ShortcutTooltip({
  enabled,
  label,
  shortcut,
  modKey,
  children,
}: {
  enabled: boolean
  label: string
  shortcut: string
  modKey: string
  children: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)

  if (!enabled) return children

  return (
    <Tooltip
      open={open}
      onOpenChange={setOpen}
      disableHoverableContent
    >
      <TooltipTrigger
        asChild
        onPointerDown={() => setOpen(false)}
        onClick={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setOpen(false)
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-2">
        {label}
        <ComposerShortcutKbd shortcut={shortcut} modKey={modKey} />
      </TooltipContent>
    </Tooltip>
  )
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
  shortcutTooltips = true,
}: ComposerProps) {
  const modKey = useModKey()
  const finePointer = useFinePointerHover()
  const shortcutsActive = shortcuts && finePointer
  const showShortcutTooltips = shortcutsActive && shortcutTooltips
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = valueProp != null
  const value = isControlled ? valueProp : uncontrolledValue
  const [files, setFiles] = React.useState<File[]>([])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
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

  function blurSendAfterSubmit() {
    sendButtonRef.current?.blur()
    textareaRef.current?.focus()
  }

  function submit() {
    if (!canSubmit) return
    onSubmit?.({
      text: value.trim(),
      files: files.length > 0 ? files : undefined,
    })
    clearAfterSubmit()
    blurSendAfterSubmit()
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
    if (action === "mode") {
      rootRef.current?.dispatchEvent(
        new CustomEvent(COMPOSER_MODE_SHORTCUT_EVENT, { bubbles: true }),
      )
      return
    }
    const root = rootRef.current
    if (!root) return
    // Prefer the real control — wrapper spans from tooltips also carry the attr.
    const target =
      root.querySelector<HTMLElement>(
        `button[data-composer-action="${action}"]`,
      ) ??
      root.querySelector<HTMLElement>(`[data-composer-action="${action}"]`)
    if (!target) return
    if (target instanceof HTMLButtonElement) {
      target.click()
      return
    }
    target.querySelector("button")?.click()
  }

  function handleEnterKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return

    // Touch / coarse: Enter inserts a newline; send only via the button.
    if (!finePointer) return

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
    if (!shortcutsActive) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return
      if (!rootRef.current) return
      const active = document.activeElement
      const inside =
        active instanceof Node && rootRef.current.contains(active)
      if (!inside) return

      if (!isMod(event) || event.altKey) return

      if (event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault()
        activateAction("attach")
        return
      }
      if (event.shiftKey && event.key.toLowerCase() === "o") {
        if (event.repeat) return
        event.preventDefault()
        activateAction("mode")
        return
      }
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        activateAction("dictation")
        return
      }
      if (event.key === "Enter") {
        event.preventDefault()
        activateAction("send")
      }
    }

    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [shortcutsActive, disabled, busy, canSubmit, status])

  const resolvedMode = resolveSlot(modeSlot, slotProps)
  const resolvedMic =
    micSlot === undefined ? (
      <DefaultMicButton disabled={slotProps.disabled} />
    ) : (
      resolveSlot(micSlot, slotProps)
    )

  const defaultAttachButton = (
    <InputGroupButton
      type="button"
      size="icon-sm"
      variant="outline"
      disabled={slotProps.disabled}
      aria-label="Attach files"
      data-composer-action="attach"
      className={cn(
        CIRCLE_BTN,
        "border-border bg-background dark:bg-background",
      )}
      onClick={openFilePicker}
    >
      <PlusIcon />
    </InputGroupButton>
  )

  const primaryLabel = busy ? "Stop generating" : "Send message"
  const primaryDisabled = disabled || (!busy && !canSubmit)
  const sendShortcut = formatShortcutLabel(COMPOSER_SHORTCUTS.send, modKey)
  const ariaKeyshortcuts = finePointer
    ? `Enter ${sendShortcut} Shift+Enter`
    : undefined

  const sendControl = (
    <InputGroupButton
      ref={sendButtonRef}
      type="button"
      size="icon-sm"
      variant="default"
      disabled={primaryDisabled}
      aria-label={primaryLabel}
      data-composer-action="send"
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
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div
        ref={rootRef}
        data-composer-root=""
        className="flex w-full flex-col gap-2"
      >
        {files.length > 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            {files.length} file{files.length === 1 ? "" : "s"} attached
          </p>
        ) : null}
        <InputGroup
          className={cn(
            "w-full rounded-[1.75rem] border-border/70 bg-muted/40 shadow-none dark:bg-muted/50",
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
            ref={textareaRef}
            value={value}
            disabled={disabled || busy}
            placeholder={placeholder}
            rows={1}
            aria-keyshortcuts={ariaKeyshortcuts}
            className="field-sizing-content max-h-48 min-h-12 resize-none px-4 pt-3.5 pb-2 text-sm"
            onChange={(event) => setValue(event.currentTarget.value)}
            onKeyDown={handleEnterKey}
          />
          <InputGroupAddon
            align="block-end"
            className="min-w-0 justify-between gap-2 px-1.5 pb-1.5 pt-0"
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
              <div className="shrink-0">
                {attachSlot === undefined ? (
                  <ShortcutTooltip
                    enabled={showShortcutTooltips}
                    label="Attach"
                    shortcut={COMPOSER_SHORTCUTS.attach}
                    modKey={modKey}
                  >
                    {defaultAttachButton}
                  </ShortcutTooltip>
                ) : (
                  resolveSlot(attachSlot, slotProps)
                )}
              </div>
              {resolvedMode != null ? (
                <div className="min-w-0 flex-1 overflow-hidden">
                  {resolvedMode}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {resolvedMic != null ? (
                <ShortcutTooltip
                  enabled={showShortcutTooltips}
                  label="Dictation"
                  shortcut={COMPOSER_SHORTCUTS.dictation}
                  modKey={modKey}
                >
                  <span
                    data-composer-action="dictation"
                    className="inline-flex"
                  >
                    {resolvedMic}
                  </span>
                </ShortcutTooltip>
              ) : null}
              <ShortcutTooltip
                enabled={showShortcutTooltips}
                label={busy ? "Stop" : "Send"}
                shortcut={COMPOSER_SHORTCUTS.send}
                modKey={modKey}
              >
                {primaryDisabled ? (
                  <span className="inline-flex">{sendControl}</span>
                ) : (
                  sendControl
                )}
              </ShortcutTooltip>
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
