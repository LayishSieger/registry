"use client"

import * as React from "react"
import {
  Questionnaire as QuestionnairePrimitive,
  type QuestionnaireItemStatus,
} from "@shadcn/react/questionnaire"
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerDownLeftIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  useInteractiveFocusRegistration,
  isOwnedPortaledOverlay,
  rootHasOpenPortaledOverlay,
  type InteractiveFocusTrigger,
} from "@/registry/new-york/blocks/ask/interactive-focus"

export {
  InteractiveFocusProvider,
  InteractiveFocusSurface,
  useInteractiveFocusSurface,
} from "@/registry/new-york/blocks/ask/interactive-focus"
export type { InteractiveFocusTrigger } from "@/registry/new-york/blocks/ask/interactive-focus"

const DEFAULT_AUTO_ADVANCE_DELAY_MS = 380

const CARD_ROW_CLASS =
  "group/questionnaire-choice relative flex min-h-11 items-center justify-between gap-3 rounded-md border border-input px-2.5 py-2 text-start text-sm transition-[color,background-color] outline-none select-none hover:bg-accent/60 has-[>input:focus-visible]:ring-1 has-[>input:focus-visible]:ring-ring/70 sm:border-transparent sm:px-2 sm:py-1.5"

const PLAIN_ROW_CLASS =
  "group/questionnaire-choice relative flex min-h-11 items-start justify-between gap-3 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none hover:bg-muted/50 has-[>input:focus-visible]:border-foreground/40 data-checked:border-primary/40 data-checked:bg-muted"

const TOUCH_ACTION_CLASS = "min-h-11 sm:min-h-0"

const BATCH_BADGE_CLASS =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-medium"

type OtherDraft = {
  text: string
  committed: boolean
}

type OtherTrailingAction = "commit" | "deselect-keep-text" | "focus-input"

function emptyOtherDraft(): OtherDraft {
  return { text: "", committed: false }
}

function resolveOtherTrailingAction(args: {
  committed: boolean
  focused: boolean
  text: string
}): OtherTrailingAction {
  if (args.focused && args.text.trim().length > 0) return "commit"
  if (args.committed && !args.focused) return "deselect-keep-text"
  return "focus-input"
}

export type AskChoice = {
  value: string
  label: string
  /** Optional subtext under the answer label. */
  description?: string
}

export type AskVariant = "card" | "plain"

type AskItemBase = {
  name: string
  title: string
  description?: string
  required?: boolean
  choices: AskChoice[]
  input?: {
    label: string
    placeholder?: string
  }
}

export type AskItem =
  | (AskItemBase & {
      multiple?: false
      /** After a single choice, go to the next slide (or review). Not valid on `multiple`. */
      autoAdvance?: boolean
    })
  | (AskItemBase & {
      multiple: true
    })

export type AskLabels = {
  previous?: string
  next?: string
  skip?: string
  submit?: string
  review?: string
  cancel?: string
  cancelTitle?: string
  cancelDescription?: string
  cancelConfirm?: string
  cancelKeep?: string
}

export type AskAnswer = {
  name: string
  title: string
  value: string | string[] | null
  label: string
}

export type AskResult =
  | { status: "submitted"; answers: AskAnswer[] }
  | { status: "canceled" }

export type AskProps = {
  items: AskItem[]
  className?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  /**
   * HITL-shaped result. Pass this straight to `addToolOutput({ output })`.
   * Submit → `{ status: "submitted", answers }`. Cancel → `{ status: "canceled" }`.
   */
  onResult?: (result: AskResult) => void
  /** After the last question, show a review step before submit. Default false. */
  review?: boolean
  /** Show a confirm-to-cancel control. Default false. */
  cancel?: boolean
  onCancel?: () => void
  autoAdvanceDelay?: number
  /**
   * Visual shell. `card` keeps the Card chrome (default).
   * `plain` drops the card background and uses bordered answer rows
   * (shadcn Questionnaire look).
   */
  variant?: AskVariant
  /**
   * Show a success toast when the batch is submitted.
   * Requires a root `<Toaster />` from `@/components/ui/sonner`.
   * Default false.
   */
  toastOnSubmit?: boolean
  /** Answer shortcut keys on choices. Default `"numbers"`. */
  shortcuts?: "numbers" | "letters" | false
  /**
   * While Command (Meta) or Ctrl is held, show Kbd hints inline on
   * Previous / Skip / Next / Submit. Default true. Only applies when
   * `shortcuts` is not `false`.
   */
  shortcutHints?: boolean
  /**
   * Gate keyboard shortcuts behind interactive focus. Clicking the Ask
   * card (or any `focusTriggers` / shared focus surface) activates it.
   * With `InteractiveFocusProvider`, Tab cycles cards by `focusPriority`.
   * Default false.
   */
  focusable?: boolean
  /**
   * When multiple focusable cards share a trigger (e.g. chat background),
   * higher priority wins. Default 0.
   */
  focusPriority?: number
  /**
   * Extra elements that activate this Ask when clicked (chat pane, preview
   * chrome, etc.). Shared surfaces from `InteractiveFocusSurface` are
   * included automatically.
   */
  focusTriggers?: InteractiveFocusTrigger[]
  /** Fires when interactive focus becomes active or inactive. */
  onFocusChange?: (focused: boolean) => void
  labels?: AskLabels
  defaultItem?: string
  item?: string
  onItemChange?: (item: string) => void
}

export const ASK_SHORTCUTS = {
  previous: "ArrowLeft",
  next: "ArrowRight",
  skip: "ArrowRight",
  submit: "Enter",
} as const

function itemAutoAdvances(item: AskItem) {
  if (item.multiple) return false
  return item.autoAdvance === true
}

function otherBadge(
  item: AskItem,
  shortcuts: AskProps["shortcuts"],
) {
  const index = item.choices.length
  if (shortcuts === "letters") {
    return index < 26 ? String.fromCharCode(65 + index) : String(index + 1)
  }
  return String(index + 1)
}

function otherShortcutKey(
  item: AskItem,
  shortcuts: AskProps["shortcuts"],
) {
  if (shortcuts === false || shortcuts == null) return null
  const index = item.choices.length
  if (shortcuts === "numbers") {
    return index < 9 ? String(index + 1) : null
  }
  return index < 26 ? String.fromCharCode(65 + index) : null
}

type ItemSelection = string | string[] | null

function emptySelection(item: AskItem): ItemSelection {
  return item.multiple ? [] : null
}

function isChoiceSelected(
  item: AskItem,
  choiceValue: string,
  selection: Record<string, ItemSelection>,
) {
  const value = selection[item.name]
  if (item.multiple) {
    return Array.isArray(value) && value.includes(choiceValue)
  }
  return value === choiceValue
}

function selectedValues(value: ItemSelection | undefined): string[] {
  return Array.isArray(value) ? value : []
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (!(target instanceof HTMLInputElement)) return false
  return !["button", "checkbox", "radio", "reset", "submit"].includes(
    target.type,
  )
}

function isChoiceInput(
  target: EventTarget | null,
): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    (target.type === "radio" || target.type === "checkbox")
  )
}

function clickSlot(
  form: HTMLFormElement | null,
  slot: "previous" | "skip" | "next" | "submit",
) {
  const button = form?.querySelector<HTMLButtonElement>(
    `[data-slot=questionnaire-${slot}]`,
  )
  if (!button || button.disabled || button.hidden) return false
  if (button.getAttribute("aria-hidden") === "true") return false
  button.click()
  return true
}

function activeChoiceInputs(form: HTMLFormElement | null) {
  if (!form) return []
  const items = [
    ...form.querySelectorAll<HTMLElement>("[data-slot=questionnaire-item]"),
  ]
  const active = items.find((item) => !item.hidden)
  if (!active) return []
  const choices = [
    ...active.querySelectorAll<HTMLInputElement>(
      "[data-slot=questionnaire-choice-input]",
    ),
  ].filter((input) => !input.disabled)
  const other = active.querySelector<HTMLInputElement>(
    "[data-slot=questionnaire-other-row] input:not([disabled])",
  )
  return other ? [...choices, other] : choices
}

function moveChoiceFocus(form: HTMLFormElement | null, delta: 1 | -1) {
  const inputs = activeChoiceInputs(form)
  if (inputs.length === 0) return
  const currentIndex = inputs.findIndex(
    (input) => input === document.activeElement,
  )
  const nextIndex =
    currentIndex < 0
      ? delta === 1
        ? 0
        : inputs.length - 1
      : (currentIndex + delta + inputs.length) % inputs.length
  inputs[nextIndex]?.focus()
}

function useModifierHeld(enabled = true) {
  const [held, setHeld] = React.useState(false)

  React.useEffect(() => {
    if (!enabled) {
      setHeld(false)
      return
    }
    const sync = (event: KeyboardEvent) => {
      setHeld(event.metaKey || event.ctrlKey)
    }
    const onBlur = () => setHeld(false)

    window.addEventListener("keydown", sync)
    window.addEventListener("keyup", sync)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", sync)
      window.removeEventListener("keyup", sync)
      window.removeEventListener("blur", onBlur)
    }
  }, [enabled])

  return enabled ? held : false
}

function AskProgress({ className }: { className?: string }) {
  return (
    <QuestionnaireProgress
      className={cn(
        "min-w-0 whitespace-nowrap text-sm font-normal tabular-nums",
        className,
      )}
      render={(props, state) => (
        <div
          {...props}
          aria-label={`Question ${state.current} of ${state.total}`}
        >
          <span className="sm:hidden">
            {state.current}/{state.total}
          </span>
          <span className="hidden sm:inline">
            Question {state.current} of {state.total}
          </span>
        </div>
      )}
    />
  )
}

function AskOptionRow({
  children,
  description,
  className,
  isPending = false,
  showHoverArrow = false,
  variant = "card",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice> & {
  description?: string
  isPending?: boolean
  showHoverArrow?: boolean
  variant?: AskVariant
}) {
  const plain = variant === "plain"
  const hasDescription = Boolean(description)

  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        plain ? PLAIN_ROW_CLASS : CARD_ROW_CLASS,
        !plain &&
          "cursor-default data-checked:bg-accent data-checked:text-accent-foreground sm:cursor-pointer",
        plain &&
          "cursor-default data-checked:text-accent-foreground sm:cursor-pointer",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        hasDescription && !plain && "items-start",
        isPending && "ring-1 ring-primary/50",
        className,
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 size-full cursor-default opacity-0 sm:cursor-pointer"
      />
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className={cn(
          "min-w-0 flex-1 leading-snug",
          hasDescription && "flex flex-col gap-0.5",
        )}
      >
        <span className={cn(hasDescription && "font-medium")}>{children}</span>
        {description ? (
          <span
            data-slot="questionnaire-choice-description"
            className="text-sm font-normal text-muted-foreground"
          >
            {description}
          </span>
        ) : null}
      </QuestionnairePrimitive.ChoiceLabel>
      <span className="relative size-6 shrink-0">
        <QuestionnairePrimitive.ChoiceShortcut
          data-slot="questionnaire-choice-shortcut"
          className={cn(
            BATCH_BADGE_CLASS,
            "pointer-events-none border-transparent text-muted-foreground group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground",
            hasDescription && "translate-y-0.5",
            showHoverArrow && "group-hover/questionnaire-choice:hidden",
          )}
        />
        {showHoverArrow ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 hidden items-center justify-center rounded-md bg-primary text-primary-foreground group-hover/questionnaire-choice:inline-flex",
              hasDescription && "translate-y-0.5",
            )}
          >
            <ArrowRightIcon className="size-3" />
          </span>
        ) : null}
      </span>
    </QuestionnairePrimitive.Choice>
  )
}

function AskOtherRow({
  name,
  label,
  placeholder = "Other",
  badge,
  disabled = false,
  isPending = false,
  committed,
  text,
  autoAdvance,
  multiple = false,
  variant = "card",
  inputRef,
  onTextChange,
  onCommit,
  onUncommitKeepText,
  onResetDraft,
  onFocusChange,
}: {
  name: string
  label: string
  placeholder?: string
  badge: string
  disabled?: boolean
  isPending?: boolean
  committed: boolean
  text: string
  autoAdvance: boolean
  multiple?: boolean
  variant?: AskVariant
  inputRef: (node: HTMLInputElement | null) => void
  onTextChange: (value: string) => void
  onCommit: () => void
  onUncommitKeepText: () => void
  onResetDraft: (refocus: boolean) => void
  onFocusChange: (focused: boolean) => void
}) {
  const localRef = React.useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = React.useState(false)
  const plain = variant === "plain"

  function setInputNode(node: HTMLInputElement | null) {
    localRef.current = node
    inputRef(node)
  }

  React.useLayoutEffect(() => {
    if (committed) return
    const el = localRef.current
    if (el && el.value !== text) el.value = text
  }, [committed, text])

  React.useLayoutEffect(() => {
    const isFocus = localRef.current === document.activeElement
    setFocused(isFocus)
  }, [committed])

  const showClear = focused && text.length > 0
  const showCommitArrow =
    focused && text.trim().length > 0 && autoAdvance
  const showCommitCheck =
    focused && text.trim().length > 0 && (multiple || !autoAdvance)
  const highlighted = focused || committed || isPending
  const trailingAction = resolveOtherTrailingAction({
    committed,
    focused,
    text,
  })

  function handleTrailingMouseDown(event: React.MouseEvent) {
    if (trailingAction === "commit" || trailingAction === "deselect-keep-text") {
      event.preventDefault()
    }
  }

  function handleTrailingClick() {
    if (disabled) return
    if (trailingAction === "commit") {
      onCommit()
      return
    }
    if (trailingAction === "deselect-keep-text") {
      onUncommitKeepText()
      localRef.current?.blur()
      return
    }
    const input = localRef.current
    if (!input) return
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  return (
    <div
      data-slot="questionnaire-other-row"
      className={cn(
        plain ? PLAIN_ROW_CLASS : CARD_ROW_CLASS,
        plain
          ? (committed || isPending) &&
              "border-primary/40 bg-muted text-accent-foreground"
          : highlighted && "bg-accent text-accent-foreground",
        isPending && "ring-1 ring-primary/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={(event) => {
        if (disabled) return
        if (event.target instanceof HTMLButtonElement) return
        localRef.current?.focus()
      }}
    >
      {committed ? (
        <QuestionnairePrimitive.Input
          key={`${name}-committed`}
          ref={setInputNode}
          aria-label={label}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onBlur={() => {
            setFocused(false)
            onFocusChange(false)
          }}
          onChange={(event) => {
            const next = event.currentTarget.value
            onTextChange(next)
            if (next.trim().length === 0) onUncommitKeepText()
          }}
          onFocus={() => {
            setFocused(true)
            onFocusChange(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.stopPropagation()
              return
            }
            if (event.key === "Backspace" && text.length === 0) {
              event.preventDefault()
              event.stopPropagation()
              onResetDraft(false)
              localRef.current?.blur()
              return
            }
            if (event.key === "Enter") {
              event.preventDefault()
              event.stopPropagation()
              onCommit()
            }
          }}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed"
        />
      ) : (
        <QuestionnairePrimitive.Input
          key={`${name}-draft`}
          ref={setInputNode}
          aria-label={label}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={() => {
            setFocused(false)
            onFocusChange(false)
          }}
          onChange={(event) => {
            event.preventDefault()
            onTextChange(event.currentTarget.value)
          }}
          onFocus={() => {
            setFocused(true)
            onFocusChange(true)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.stopPropagation()
              return
            }
            if (event.key === "Backspace" && text.length === 0) {
              event.preventDefault()
              event.stopPropagation()
              onResetDraft(false)
              localRef.current?.blur()
              return
            }
            if (event.key === "Enter") {
              event.preventDefault()
              event.stopPropagation()
              onCommit()
            }
          }}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed"
        />
      )}
      {showClear ? (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Clear Other text"
          className={cn(
            BATCH_BADGE_CLASS,
            "cursor-pointer border-transparent text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed",
          )}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onResetDraft(true)}
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label={
          showCommitCheck || showCommitArrow
            ? "Save Other answer"
            : committed && !focused
              ? "Other — click to deselect and keep your text"
              : `Other option ${badge}`
        }
        className={cn(
          BATCH_BADGE_CLASS,
          "cursor-pointer disabled:cursor-not-allowed",
          committed && !focused
            ? "border-primary bg-primary text-primary-foreground"
            : "border-transparent bg-transparent text-muted-foreground",
          (showCommitCheck || showCommitArrow) &&
            "border-primary bg-primary text-primary-foreground",
        )}
        onMouseDown={handleTrailingMouseDown}
        onClick={handleTrailingClick}
      >
        {showCommitArrow ? (
          <ArrowRightIcon className="size-3" />
        ) : showCommitCheck ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <span>{badge}</span>
        )}
      </button>
    </div>
  )
}

function skippedAnswer(item: AskItem): AskAnswer {
  return {
    name: item.name,
    title: item.title,
    value: null,
    label: "Skipped",
  }
}

function labelsForValues(item: AskItem, values: string[]) {
  return values.map(
    (value) =>
      item.choices.find((choice) => choice.value === value)?.label ?? value,
  )
}

function committedOtherText(
  itemName: string,
  otherDrafts: Record<string, OtherDraft>,
) {
  const draft = otherDrafts[itemName]
  if (!draft?.committed) return ""
  return draft.text.trim()
}

function readAnswers(
  form: HTMLFormElement,
  items: AskItem[],
  selection: Record<string, ItemSelection>,
  otherDrafts: Record<string, OtherDraft>,
): AskAnswer[] {
  const data = new FormData(form)

  return items.map((item) => {
    const other = committedOtherText(item.name, otherDrafts)

    if (item.multiple) {
      const selected = selectedValues(selection[item.name])
      const fromForm = data
        .getAll(item.name)
        .map(String)
        .filter((value) => value.length > 0 && value !== other)
      const values = selected.length > 0 ? selected : fromForm
      if (values.length === 0 && !other) return skippedAnswer(item)
      const labels = labelsForValues(item, values)
      if (other) labels.push(other)
      return {
        name: item.name,
        title: item.title,
        value: other ? [...values, other] : values,
        label: labels.join(", "),
      }
    }

    if (other) {
      return {
        name: item.name,
        title: item.title,
        value: other,
        label: other,
      }
    }

    const selected = selection[item.name]
    const fromForm = data.get(item.name)?.toString() ?? ""
    const value =
      typeof selected === "string" && selected.length > 0 ? selected : fromForm
    if (!value) return skippedAnswer(item)
    const choice = item.choices.find((entry) => entry.value === value)
    return {
      name: item.name,
      title: item.title,
      value,
      label: choice?.label ?? value,
    }
  })
}

function useAutoAdvance(delay: number) {
  const [pendingKey, setPendingKey] = React.useState<string | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPendingKey(null)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const schedule = React.useCallback(
    (key: string, advance: () => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setPendingKey(key)
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        setPendingKey(null)
        advance()
      }, delay)
    },
    [delay],
  )

  return { pendingKey, schedule, clear }
}

function ShortcutKey({ part }: { part: string }) {
  if (part === "ArrowLeft") {
    return (
      <Kbd>
        <ArrowLeftIcon aria-label="Left arrow" />
      </Kbd>
    )
  }
  if (part === "ArrowRight") {
    return (
      <Kbd>
        <ArrowRightIcon aria-label="Right arrow" />
      </Kbd>
    )
  }
  if (part === "ArrowUp") {
    return (
      <Kbd>
        <ArrowUpIcon aria-label="Up arrow" />
      </Kbd>
    )
  }
  if (part === "ArrowDown") {
    return (
      <Kbd>
        <ArrowDownIcon aria-label="Down arrow" />
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

export function AskShortcutKbd({
  shortcut,
  className,
}: {
  shortcut: string
  className?: string
}) {
  const parts = shortcut.split("+")

  return (
    <KbdGroup className={cn("align-middle", className)}>
      {parts.map((part, index) => (
        <ShortcutKey key={`${shortcut}-${index}-${part}`} part={part} />
      ))}
    </KbdGroup>
  )
}

function ActionShortcutHint({
  shortcut,
  visible,
}: {
  shortcut: string
  visible: boolean
}) {
  if (!visible) return null

  return (
    <AskShortcutKbd
      shortcut={shortcut}
      className="shrink-0 **:data-[slot=kbd]:bg-current/15 **:data-[slot=kbd]:text-current"
    />
  )
}

function CancelBatchButton({
  labels,
  onCancel,
  className,
}: {
  labels?: AskLabels
  onCancel?: () => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-11 sm:size-9", className)}
          aria-label={labels?.cancel ?? "Cancel batch"}
        >
          <XIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-72">
        <PopoverHeader>
          <PopoverTitle>
            {labels?.cancelTitle ?? "Cancel this batch?"}
          </PopoverTitle>
          <PopoverDescription>
            {labels?.cancelDescription ??
              "Your current answers in this batch will be discarded."}
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {labels?.cancelKeep ?? "Keep answering"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setOpen(false)
              onCancel?.()
            }}
          >
            {labels?.cancelConfirm ?? "Cancel batch"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function Ask({
  items,
  className,
  onSubmit,
  onResult,
  review = false,
  cancel = false,
  onCancel,
  autoAdvanceDelay = DEFAULT_AUTO_ADVANCE_DELAY_MS,
  variant = "card",
  toastOnSubmit = false,
  shortcuts = "numbers",
  shortcutHints = true,
  focusable = false,
  focusPriority = 0,
  focusTriggers,
  onFocusChange,
  labels,
  defaultItem,
  item: itemProp,
  onItemChange,
}: AskProps) {
  const plain = variant === "plain"
  const firstName = items[0]?.name ?? ""
  const lastName = items.at(-1)?.name
  const formRef = React.useRef<HTMLFormElement>(null)
  const { focused: interactiveFocused } = useInteractiveFocusRegistration({
    enabled: focusable,
    priority: focusPriority,
    rootRef: formRef as React.RefObject<HTMLElement | null>,
    triggers: focusTriggers,
    onFocusChange,
  })
  const keyboardArmed = !focusable || interactiveFocused
  const modifierHeld = useModifierHeld(keyboardArmed)
  const showShortcutHints =
    shortcuts !== false && shortcutHints && modifierHeld && keyboardArmed
  const [phase, setPhase] = React.useState<"questions" | "review">("questions")
  const [reviewAnswers, setReviewAnswers] = React.useState<
    AskAnswer[]
  >([])
  const [itemStatus, setItemStatus] = React.useState<
    Partial<Record<string, QuestionnaireItemStatus>>
  >({})
  const [selection, setSelection] = React.useState<
    Record<string, ItemSelection>
  >({})
  const selectionRef = React.useRef(selection)
  const [otherDrafts, setOtherDrafts] = React.useState<
    Record<string, OtherDraft>
  >({})
  const otherDraftsRef = React.useRef(otherDrafts)
  const [otherFocusedName, setOtherFocusedName] = React.useState<string | null>(
    null,
  )
  const otherInputRefs = React.useRef<Record<string, HTMLInputElement | null>>(
    {},
  )
  const [uncontrolledItem, setUncontrolledItem] = React.useState(
    () => defaultItem ?? firstName,
  )
  const activeItem = itemProp ?? uncontrolledItem
  const activeItemRef = React.useRef(activeItem)

  React.useEffect(() => {
    selectionRef.current = selection
  }, [selection])
  React.useEffect(() => {
    otherDraftsRef.current = otherDrafts
  }, [otherDrafts])
  React.useEffect(() => {
    activeItemRef.current = activeItem
  }, [activeItem])

  const { pendingKey, schedule, clear } = useAutoAdvance(autoAdvanceDelay)

  const setActiveItem = React.useCallback(
    (next: string) => {
      if (itemProp == null) setUncontrolledItem(next)
      onItemChange?.(next)
    },
    [itemProp, onItemChange],
  )

  function handleItemChange(next: string) {
    clear()
    setActiveItem(next)
  }

  function restoreBatchKeyboard() {
    requestAnimationFrame(() => {
      formRef.current?.focus({ preventScroll: true })
    })
  }

  function blurOther(name: string) {
    otherInputRefs.current[name]?.blur()
    setOtherFocusedName((current) => (current === name ? null : current))
  }

  function enterReview() {
    clear()
    if (formRef.current) {
      setReviewAnswers(
        readAnswers(
          formRef.current,
          items,
          selectionRef.current,
          otherDraftsRef.current,
        ),
      )
    }
    setPhase("review")
  }

  React.useLayoutEffect(() => {
    if (phase !== "review") return
    formRef.current?.focus({ preventScroll: true })
  }, [phase])

  function leaveReview() {
    setPhase("questions")
  }

  function continueForward() {
    if (showReviewNext) {
      if (hasAnswer) enterReview()
      return
    }
    if (clickSlot(formRef.current, "next")) return
    clickSlot(formRef.current, "submit")
  }

  function handleAskKeyDown(
    event: KeyboardEvent | React.KeyboardEvent<HTMLFormElement>,
  ) {
    if (!keyboardArmed) return
    if (event.defaultPrevented) return
    const composing =
      "nativeEvent" in event
        ? event.nativeEvent.isComposing
        : event.isComposing
    if (composing) return
    if (event.metaKey || event.ctrlKey || event.altKey) return

    const form = formRef.current
    // Pause Ask shortcuts while cancel (or similar) confirm UI is open.
    if (rootHasOpenPortaledOverlay(form)) return

    const target = event.target
    const key = event.key
    // ↑/↓ still cycle choices (including Other) while the Other text field is focused.
    const isVerticalChoiceNav = key === "ArrowUp" || key === "ArrowDown"
    if (form && target instanceof Node && !form.contains(target)) {
      if (isEditableTarget(target)) return
      // Cancel (and similar) UI is portaled; don't drive Ask under it.
      if (isOwnedPortaledOverlay(form, target)) return
    } else if (isEditableTarget(target) && !isVerticalChoiceNav) {
      return
    }

    if (phase === "review") {
      if (key === "ArrowLeft") {
        event.preventDefault()
        leaveReview()
      } else if (key === "Enter") {
        event.preventDefault()
        clickSlot(form, "submit")
      }
      return
    }

    if (pendingKey != null && (key === "ArrowLeft" || key === "ArrowRight")) {
      event.preventDefault()
      return
    }

    if (isVerticalChoiceNav) {
      event.preventDefault()
      if ("stopPropagation" in event) event.stopPropagation()
      moveChoiceFocus(form, key === "ArrowDown" ? 1 : -1)
      return
    }

    if (key === "ArrowLeft") {
      // Prevent native radio group ←/→ from changing answers.
      event.preventDefault()
      if ("stopPropagation" in event) event.stopPropagation()
      clickSlot(form, "previous")
      return
    }

    if (key === "ArrowRight") {
      event.preventDefault()
      if ("stopPropagation" in event) event.stopPropagation()
      if (nextIsShowing) {
        if (showReviewNext) {
          if (hasAnswer) enterReview()
          return
        }
        clickSlot(form, "next")
        return
      }
      if (!skipWouldSubmit) clickSlot(form, "skip")
      return
    }

    if (
      activeSlide?.input &&
      otherShortcutKey(activeSlide, shortcuts) &&
      key.toUpperCase() === otherShortcutKey(activeSlide, shortcuts)
    ) {
      event.preventDefault()
      applyOtherTrailing(activeSlide)
      return
    }

    if (key === " " && isChoiceInput(target)) {
      event.preventDefault()
      target.click()
      return
    }

    if (key !== "Enter") return

    if (isChoiceInput(target) && activeSlide) {
      const focusedSelected = isChoiceSelected(
        activeSlide,
        target.value,
        selection,
      )
      if (!hasAnswer || !focusedSelected) {
        event.preventDefault()
        target.click()
        return
      }
      event.preventDefault()
      continueForward()
      return
    }

    if (hasAnswer) {
      event.preventDefault()
      continueForward()
    }
  }

  const handleAskKeyDownRef = React.useRef(handleAskKeyDown)
  handleAskKeyDownRef.current = handleAskKeyDown

  React.useEffect(() => {
    if (!focusable || !keyboardArmed) return
    // Capture-phase so ←/→ never hit native radio group navigation.
    // Only arrows here; Enter/numbers stay on the form handler.
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown"
      ) {
        return
      }
      handleAskKeyDownRef.current(event)
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
  }, [focusable, keyboardArmed])

  function goToNextFrom(fromName: string) {
    if (activeItemRef.current !== fromName) return
    const index = items.findIndex((item) => item.name === fromName)
    const next = items[index + 1]
    if (next) {
      setActiveItem(next.name)
      return
    }
    if (review) enterReview()
  }

  function emitCancel() {
    onResult?.({ status: "canceled" })
    onCancel?.()
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Skip on the last item calls form.requestSubmit(). Intercept that
    // while questions are still open so review is not bypassed.
    if (review && phase === "questions") {
      event.preventDefault()
      enterReview()
      return
    }
    event.preventDefault()
    const answers = readAnswers(
      event.currentTarget,
      items,
      selectionRef.current,
      otherDraftsRef.current,
    )
    const result: AskResult = { status: "submitted", answers }
    if (toastOnSubmit) {
      const summary = answers
        .map((answer) => `${answer.title}: ${answer.label}`)
        .join(" · ")
      toast.success("Submitted", {
        description: summary || "Batch submitted.",
      })
    }
    onResult?.(result)
    onSubmit?.(event)
  }

  const collection = items.map((item) => ({
    name: item.name,
    required: item.required,
    choices: item.choices.map((choice) => ({ value: choice.value })),
  }))

  const showReviewNext =
    review && phase === "questions" && activeItem === lastName
  const activeSlide = items.find((item) => item.name === activeItem)
  const hasAnswer = itemStatus[activeItem ?? ""] === "answered"
  const autoAdvanceSlide =
    Boolean(activeSlide) && itemAutoAdvances(activeSlide!)
  const hideAutoAdvanceNext =
    autoAdvanceSlide && (!hasAnswer || pendingKey != null)
  const nextIsShowing =
    !hideAutoAdvanceNext && Boolean(showReviewNext || activeItem !== lastName)
  const skipWouldSubmit = activeItem === lastName && !review
  const skipHasArrow = !nextIsShowing && !skipWouldSubmit
  const typingOtherSingle =
    Boolean(activeSlide && !activeSlide.multiple && activeSlide.input) &&
    (otherDrafts[activeItem ?? ""]?.text.length ?? 0) > 0
  const hideSkip = pendingKey != null || typingOtherSingle
  const hasPrevious =
    phase === "review" || (items.length > 1 && activeItem !== firstName)
  const hasSkip =
    phase === "questions" &&
    activeSlide != null &&
    !activeSlide.required &&
    !hideSkip
  const hasNext = phase === "questions" && nextIsShowing
  const hasSubmit =
    phase === "review" ||
    (phase === "questions" && activeItem === lastName && !review)
  const showActions = hasPrevious || hasSkip || hasNext || hasSubmit
  const backLabel = labels?.previous ?? "Back"
  const skipLabel = labels?.skip ?? "Skip"
  const nextLabel = labels?.next ?? "Next"
  const showCancel = cancel

  function clearItemSelection(name: string) {
    const item = items.find((entry) => entry.name === name)
    if (!item) return
    setSelection((current) => ({
      ...current,
      [name]: emptySelection(item),
    }))
  }

  function patchOtherDraft(name: string, patch: Partial<OtherDraft>) {
    setOtherDrafts((current) => {
      const previous = current[name] ?? emptyOtherDraft()
      return {
        ...current,
        [name]: { ...previous, ...patch },
      }
    })
  }

  function resetOtherDraft(name: string) {
    setOtherDrafts((current) => ({
      ...current,
      [name]: emptyOtherDraft(),
    }))
  }

  function uncommitOther(item: AskItem, keepText = true) {
    setOtherDrafts((current) => {
      const previous = current[item.name] ?? emptyOtherDraft()
      return {
        ...current,
        [item.name]: {
          text: keepText ? previous.text : "",
          committed: false,
        },
      }
    })
    if (!item.multiple && keepText) {
      const selected = selectionRef.current[item.name]
      if (
        typeof selected === "string" &&
        selected ===
          committedOtherText(item.name, otherDraftsRef.current)
      ) {
        setSelection((current) => ({
          ...current,
          [item.name]: null,
        }))
      }
    }
    blurOther(item.name)
    restoreBatchKeyboard()
  }

  function commitOther(item: AskItem) {
    if (pendingKey != null) return
    const raw = otherDraftsRef.current[item.name]?.text ?? ""
    const trimmed = raw.trim()
    if (!trimmed) {
      resetOtherDraft(item.name)
      if (!item.multiple) {
        setSelection((current) => ({
          ...current,
          [item.name]: null,
        }))
      }
      blurOther(item.name)
      restoreBatchKeyboard()
      return
    }

    setOtherDrafts((current) => ({
      ...current,
      [item.name]: { text: raw, committed: true },
    }))

    if (item.multiple) {
      blurOther(item.name)
      restoreBatchKeyboard()
      return
    }

    setSelection((current) => ({
      ...current,
      [item.name]: trimmed,
    }))
    blurOther(item.name)
    restoreBatchKeyboard()

    const isLast = item.name === lastName
    const hasNext = !isLast || review
    if (!itemAutoAdvances(item) || !hasNext) return
    schedule(`${item.name}:other`, () => goToNextFrom(item.name))
  }

  function applyOtherTrailing(item: AskItem) {
    if (pendingKey != null) return
    const draft = otherDrafts[item.name] ?? emptyOtherDraft()
    const action = resolveOtherTrailingAction({
      committed: draft.committed,
      focused: otherFocusedName === item.name,
      text: draft.text,
    })
    if (action === "commit") {
      commitOther(item)
      return
    }
    if (action === "deselect-keep-text") {
      uncommitOther(item)
      return
    }
    const input = otherInputRefs.current[item.name]
    if (!input) return
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  return (
      <Questionnaire
        ref={formRef}
        tabIndex={-1}
        data-ask-focused={interactiveFocused ? "true" : "false"}
        className={cn("w-full outline-none", className)}
        defaultItem={defaultItem}
        item={activeItem || undefined}
        items={collection}
        shortcuts={shortcuts === false ? undefined : shortcuts}
        onItemChange={handleItemChange}
        onKeyDown={(event) => {
          if (focusable && !keyboardArmed) {
            // Form may still be focused briefly; don't let Questionnaire act.
            event.preventDefault()
            event.stopPropagation()
            return
          }
          handleAskKeyDownRef.current(event)
        }}
        onSubmit={handleSubmit}
      >
      <Card
        className={cn(
          !plain && "gap-2!",
          plain &&
            "gap-4 rounded-none bg-transparent py-0 ring-0 [--card-spacing:--spacing(0)] has-data-[slot=card-footer]:pb-0",
          showCancel &&
            phase === "questions" &&
            "relative",
          showCancel && phase === "questions" && !plain && "pt-2",
          // One elevated surface for both states (lighter than muted/accent so
          // option hover still reads). Focus only restores the default card ring.
          focusable && !plain && "bg-sidebar",
          focusable && !plain && !interactiveFocused && "ring-0",
        )}
      >
        {showCancel && phase === "questions" ? (
          <CancelBatchButton
            className={cn(
              "absolute z-10",
              plain ? "top-0 right-0" : "top-2 right-2",
            )}
            labels={labels}
            onCancel={emitCancel}
          />
        ) : null}
        <div hidden={phase === "review"}>
          {items.map((item) => {
            const titleId = `ask-${item.name}-title`
            const canAutoAdvance = itemAutoAdvances(item)
            const isLast = item.name === lastName
            const hasNext = !isLast || review

            return (
              <QuestionnaireItem
                key={item.name}
                aria-labelledby={titleId}
                name={item.name}
                required={item.required}
                multiple={item.multiple}
                onStatusChange={(status) => {
                  setItemStatus((current) => ({
                    ...current,
                    [item.name]: status,
                  }))
                }}
              >
                <CardHeader
                  className={cn(
                    "gap-0.5",
                    plain && "rounded-none px-0",
                  )}
                >
                  {showCancel ? (
                    <AskProgress className="pr-10" />
                  ) : null}
                  <QuestionnaireTitle
                    id={titleId}
                    className="mb-0"
                    render={<CardTitle />}
                  >
                    {item.title}
                  </QuestionnaireTitle>
                  {showCancel ? null : (
                    <CardAction className="row-span-1">
                      <AskProgress />
                    </CardAction>
                  )}
                  {item.description ? (
                    <QuestionnaireDescription
                      className={cn(!showCancel && "col-span-full")}
                      render={<CardDescription />}
                    >
                      {item.description}
                    </QuestionnaireDescription>
                  ) : null}
                </CardHeader>
                <CardContent className={cn(plain && "px-0")}>
                  <QuestionnaireChoices
                    className={cn(plain ? "gap-2" : "gap-2 sm:gap-1")}
                  >
                    {item.choices.map((choice) => {
                      const choiceKey = `${item.name}:${choice.value}`
                      const isPending = pendingKey === choiceKey
                      const isSelected = isChoiceSelected(
                        item,
                        choice.value,
                        selection,
                      )
                      const showHoverArrow =
                        canAutoAdvance &&
                        itemStatus[item.name] !== "answered" &&
                        !isSelected

                      return (
                        <AskOptionRow
                          key={choice.value}
                          checked={isSelected}
                          description={choice.description}
                          disabled={pendingKey != null && !isPending}
                          isPending={isPending}
                          showHoverArrow={showHoverArrow}
                          value={choice.value}
                          variant={variant}
                          onClick={() => {
                            if (item.multiple || !isSelected) return
                            clear()
                            clearItemSelection(item.name)
                          }}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked
                            const value = choice.value

                            if (!item.multiple) {
                              setOtherDrafts((current) => {
                                const previous =
                                  current[item.name] ?? emptyOtherDraft()
                                if (!previous.committed) return current
                                return {
                                  ...current,
                                  [item.name]: {
                                    ...previous,
                                    committed: false,
                                  },
                                }
                              })
                            }

                            setSelection((current) => {
                              if (item.multiple) {
                                const selected = selectedValues(
                                  current[item.name],
                                )
                                return {
                                  ...current,
                                  [item.name]: checked
                                    ? [...selected, value]
                                    : selected.filter((entry) => entry !== value),
                                }
                              }
                              return {
                                ...current,
                                [item.name]: checked ? value : null,
                              }
                            })

                            if (!checked) {
                              clear()
                              return
                            }
                            if (!canAutoAdvance || !hasNext) return
                            if (itemStatus[item.name] === "answered") return
                            schedule(choiceKey, () => goToNextFrom(item.name))
                          }}
                        >
                          {choice.label}
                        </AskOptionRow>
                      )
                    })}
                    {item.input ? (
                      <AskOtherRow
                        name={item.name}
                        label={item.input.label}
                        placeholder={item.input.placeholder}
                        badge={otherBadge(item, shortcuts)}
                        disabled={pendingKey != null}
                        isPending={pendingKey === `${item.name}:other`}
                        committed={
                          otherDrafts[item.name]?.committed ?? false
                        }
                        text={otherDrafts[item.name]?.text ?? ""}
                        autoAdvance={canAutoAdvance}
                        multiple={item.multiple === true}
                        variant={variant}
                        inputRef={(node) => {
                          otherInputRefs.current[item.name] = node
                        }}
                        onTextChange={(value) => {
                          patchOtherDraft(item.name, { text: value })
                          if (
                            !item.multiple &&
                            (otherDrafts[item.name]?.committed ?? false)
                          ) {
                            setSelection((current) => ({
                              ...current,
                              [item.name]: value.trim() || null,
                            }))
                          }
                        }}
                        onCommit={() => commitOther(item)}
                        onUncommitKeepText={() => uncommitOther(item)}
                        onResetDraft={(refocus) => {
                          resetOtherDraft(item.name)
                          if (!item.multiple) {
                            const selected = selectionRef.current[item.name]
                            const other = committedOtherText(
                              item.name,
                              otherDraftsRef.current,
                            )
                            if (
                              typeof selected === "string" &&
                              selected === other
                            ) {
                              setSelection((current) => ({
                                ...current,
                                [item.name]: null,
                              }))
                            }
                          }
                          if (refocus) {
                            requestAnimationFrame(() =>
                              otherInputRefs.current[item.name]?.focus(),
                            )
                          } else {
                            blurOther(item.name)
                            restoreBatchKeyboard()
                          }
                        }}
                        onFocusChange={(focused) =>
                          setOtherFocusedName(focused ? item.name : null)
                        }
                      />
                    ) : null}
                  </QuestionnaireChoices>
                  <QuestionnaireError />
                </CardContent>
              </QuestionnaireItem>
            )
          })}
        </div>
        {phase === "review" ? (
          <>
            <CardHeader className={cn(plain && "rounded-none px-0")}>
              <CardTitle>{labels?.review ?? "Review"}</CardTitle>
              <CardDescription>Submit this batch?</CardDescription>
              {showCancel ? (
                <CardAction>
                  <CancelBatchButton labels={labels} onCancel={emitCancel} />
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent className={cn(plain && "px-0")}>
              <ul className="flex flex-col gap-4">
                {reviewAnswers.map((answer) => (
                  <li key={answer.name} className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">
                      {answer.title}
                    </p>
                    <p className="text-sm font-medium">{answer.label}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </>
        ) : null}
        {showActions ? (
          <CardFooter
            className={cn(
              "border-t-0 bg-transparent p-0 px-(--card-spacing) pt-1 pb-(--card-spacing)",
              plain && "px-0 pb-0",
            )}
          >
          <QuestionnaireActions className="w-full">
            {phase === "review" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "col-start-1 row-start-1 justify-self-start",
                    TOUCH_ACTION_CLASS,
                  )}
                  onClick={leaveReview}
                >
                  <ActionShortcutHint
                    shortcut={ASK_SHORTCUTS.previous}
                    visible={showShortcutHints}
                  />
                  {backLabel}
                </Button>
                <QuestionnaireSubmit>
                  {labels?.submit ?? "Submit"}
                  <ActionShortcutHint
                    shortcut={ASK_SHORTCUTS.submit}
                    visible={showShortcutHints}
                  />
                </QuestionnaireSubmit>
              </>
            ) : (
              <>
                <QuestionnairePrevious>
                  <ActionShortcutHint
                    shortcut={ASK_SHORTCUTS.previous}
                    visible={showShortcutHints}
                  />
                  {backLabel}
                </QuestionnairePrevious>
                <QuestionnaireSkip
                  className={cn(
                    hideSkip && "hidden",
                    skipHasArrow && "col-start-3",
                  )}
                  disabled={hideSkip}
                  onClick={() => {
                    if (!activeItem) return
                    clear()
                    clearItemSelection(activeItem)
                    resetOtherDraft(activeItem)
                  }}
                >
                  {skipLabel}
                  <ActionShortcutHint
                    shortcut={ASK_SHORTCUTS.skip}
                    visible={showShortcutHints && !hideSkip}
                  />
                </QuestionnaireSkip>
                {showReviewNext ? (
                  hideAutoAdvanceNext ? null : !hasAnswer ? (
                    <span className="col-start-3 row-start-1 inline-flex justify-self-end">
                      <Button
                        type="button"
                        disabled
                        className={TOUCH_ACTION_CLASS}
                        onClick={enterReview}
                      >
                        {nextLabel}
                        <ActionShortcutHint
                          shortcut={ASK_SHORTCUTS.next}
                          visible={showShortcutHints}
                        />
                      </Button>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      className={cn(
                        "col-start-3 row-start-1 justify-self-end",
                        TOUCH_ACTION_CLASS,
                      )}
                      onClick={enterReview}
                    >
                      {nextLabel}
                      <ActionShortcutHint
                        shortcut={ASK_SHORTCUTS.next}
                        visible={showShortcutHints}
                      />
                    </Button>
                  )
                ) : (
                  <>
                    {hideAutoAdvanceNext ? null : (
                      <QuestionnaireNext>
                        {nextLabel}
                        <ActionShortcutHint
                          shortcut={ASK_SHORTCUTS.next}
                          visible={showShortcutHints}
                        />
                      </QuestionnaireNext>
                    )}
                    <QuestionnaireSubmit>
                      {labels?.submit ?? "Submit"}
                      <ActionShortcutHint
                        shortcut={ASK_SHORTCUTS.submit}
                        visible={showShortcutHints}
                      />
                    </QuestionnaireSubmit>
                  </>
                )}
              </>
            )}
          </QuestionnaireActions>
          </CardFooter>
        ) : null}
      </Card>
      </Questionnaire>
  )
}
