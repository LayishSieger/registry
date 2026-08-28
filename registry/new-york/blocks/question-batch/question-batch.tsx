"use client"

import * as React from "react"
import {
  Questionnaire as QuestionnairePrimitive,
  type QuestionnaireItemStatus,
} from "@shadcn/react/questionnaire"
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react"

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
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
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
import { cn } from "@/lib/utils"

const DEFAULT_AUTO_ADVANCE_DELAY_MS = 380

export type QuestionBatchChoice = {
  value: string
  label: string
}

type QuestionBatchItemBase = {
  name: string
  title: string
  description?: string
  required?: boolean
  choices: QuestionBatchChoice[]
  input?: {
    label: string
    placeholder?: string
  }
}

export type QuestionBatchItem =
  | (QuestionBatchItemBase & {
      multiple?: false
      /** After a single choice, go to the next slide (or review). Not valid on `multiple`. */
      autoAdvance?: boolean
    })
  | (QuestionBatchItemBase & {
      multiple: true
    })

export type QuestionBatchLabels = {
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

export type QuestionBatchAnswer = {
  name: string
  title: string
  value: string | string[] | null
  label: string
}

export type QuestionBatchResult =
  | { status: "submitted"; answers: QuestionBatchAnswer[] }
  | { status: "canceled" }

export type QuestionBatchProps = {
  items: QuestionBatchItem[]
  className?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  /**
   * HITL-shaped result. Pass this straight to `addToolOutput({ output })`.
   * Submit → `{ status: "submitted", answers }`. Cancel → `{ status: "canceled" }`.
   */
  onResult?: (result: QuestionBatchResult) => void
  /** After the last question, show a review step before submit. Default false. */
  review?: boolean
  /** Show a confirm-to-cancel control. Default false. */
  cancel?: boolean
  onCancel?: () => void
  autoAdvanceDelay?: number
  shortcuts?: "numbers" | "letters" | false
  labels?: QuestionBatchLabels
  defaultItem?: string
  item?: string
  onItemChange?: (item: string) => void
}

function itemAutoAdvances(item: QuestionBatchItem) {
  if (item.multiple) return false
  return item.autoAdvance === true
}

type ItemSelection = string | string[] | null

function emptySelection(item: QuestionBatchItem): ItemSelection {
  return item.multiple ? [] : null
}

function isChoiceSelected(
  item: QuestionBatchItem,
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
  return [
    ...active.querySelectorAll<HTMLInputElement>(
      "[data-slot=questionnaire-choice-input]",
    ),
  ].filter((input) => !input.disabled)
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

function QuestionBatchOptionRow({
  children,
  className,
  isPending = false,
  showHoverArrow = false,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice> & {
  isPending?: boolean
  showHoverArrow?: boolean
}) {
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-start text-sm transition-[color,background-color] outline-none select-none hover:bg-accent/60 has-[>input:focus-visible]:ring-1 has-[>input:focus-visible]:ring-ring/70 data-checked:bg-accent data-checked:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
        isPending && "ring-1 ring-primary/50",
        className,
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className="min-w-0 flex-1 leading-snug"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <span className="relative size-6 shrink-0">
        <QuestionnairePrimitive.ChoiceShortcut
          data-slot="questionnaire-choice-shortcut"
          className={cn(
            "pointer-events-none inline-flex size-6 items-center justify-center rounded-md border border-transparent font-mono text-xs font-medium text-muted-foreground group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground",
            showHoverArrow && "group-hover/questionnaire-choice:hidden",
          )}
        />
        {showHoverArrow ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-md bg-primary text-primary-foreground group-hover/questionnaire-choice:inline-flex"
          >
            <ArrowRightIcon className="size-3" />
          </span>
        ) : null}
      </span>
    </QuestionnairePrimitive.Choice>
  )
}

function skippedAnswer(item: QuestionBatchItem): QuestionBatchAnswer {
  return {
    name: item.name,
    title: item.title,
    value: null,
    label: "Skipped",
  }
}

function labelsForValues(item: QuestionBatchItem, values: string[]) {
  return values.map(
    (value) =>
      item.choices.find((choice) => choice.value === value)?.label ?? value,
  )
}

function readAnswers(
  form: HTMLFormElement,
  items: QuestionBatchItem[],
  selection: Record<string, ItemSelection>,
): QuestionBatchAnswer[] {
  const data = new FormData(form)

  return items.map((item) => {
    if (item.multiple) {
      const selected = selectedValues(selection[item.name])
      const fromForm = data.getAll(item.name).map(String).filter(Boolean)
      const values = selected.length > 0 ? selected : fromForm
      if (values.length === 0) return skippedAnswer(item)
      return {
        name: item.name,
        title: item.title,
        value: values,
        label: labelsForValues(item, values).join(", "),
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

function CancelBatchButton({
  labels,
  onCancel,
}: {
  labels?: QuestionBatchLabels
  onCancel?: () => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
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

export function QuestionBatch({
  items,
  className,
  onSubmit,
  onResult,
  review = false,
  cancel = false,
  onCancel,
  autoAdvanceDelay = DEFAULT_AUTO_ADVANCE_DELAY_MS,
  shortcuts = "numbers",
  labels,
  defaultItem,
  item: itemProp,
  onItemChange,
}: QuestionBatchProps) {
  const firstName = items[0]?.name ?? ""
  const lastName = items.at(-1)?.name
  const formRef = React.useRef<HTMLFormElement>(null)
  const [phase, setPhase] = React.useState<"questions" | "review">("questions")
  const [reviewAnswers, setReviewAnswers] = React.useState<
    QuestionBatchAnswer[]
  >([])
  const [itemStatus, setItemStatus] = React.useState<
    Partial<Record<string, QuestionnaireItemStatus>>
  >({})
  const [selection, setSelection] = React.useState<
    Record<string, ItemSelection>
  >({})
  const selectionRef = React.useRef(selection)
  selectionRef.current = selection
  const [uncontrolledItem, setUncontrolledItem] = React.useState(
    () => defaultItem ?? firstName,
  )
  const activeItem = itemProp ?? uncontrolledItem
  const activeItemRef = React.useRef(activeItem)
  activeItemRef.current = activeItem

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

  function enterReview() {
    clear()
    if (formRef.current) {
      setReviewAnswers(
        readAnswers(formRef.current, items, selectionRef.current),
      )
    }
    setPhase("review")
  }

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

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (isEditableTarget(event.target)) return

    const key = event.key
    const form = formRef.current

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

    if (key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault()
      moveChoiceFocus(form, key === "ArrowDown" ? 1 : -1)
      return
    }

    if (key === "ArrowLeft") {
      event.preventDefault()
      clickSlot(form, "previous")
      return
    }

    if (key === "ArrowRight") {
      event.preventDefault()
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

    if (key === " " && isChoiceInput(event.target)) {
      event.preventDefault()
      event.target.click()
      return
    }

    if (key !== "Enter") return

    if (isChoiceInput(event.target) && activeSlide) {
      const focusedSelected = isChoiceSelected(
        activeSlide,
        event.target.value,
        selection,
      )
      if (!hasAnswer || !focusedSelected) {
        event.preventDefault()
        event.target.click()
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
    onResult?.({
      status: "submitted",
      answers: readAnswers(
        event.currentTarget,
        items,
        selectionRef.current,
      ),
    })
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
    Boolean(activeSlide) &&
    itemAutoAdvances(activeSlide!) &&
    !activeSlide?.input
  const hideAutoAdvanceNext =
    autoAdvanceSlide && (!hasAnswer || pendingKey != null)
  const nextIsShowing =
    !hideAutoAdvanceNext && Boolean(showReviewNext || activeItem !== lastName)
  const skipWouldSubmit = activeItem === lastName && !review
  const skipHasArrow = !nextIsShowing && !skipWouldSubmit
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

  return (
    <Questionnaire
      ref={formRef}
      className={cn("w-full", className)}
      defaultItem={defaultItem}
      item={activeItem || undefined}
      items={collection}
      shortcuts={shortcuts === false ? undefined : shortcuts}
      onItemChange={handleItemChange}
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    >
      <Card>
        <div hidden={phase === "review"}>
          {items.map((item) => {
            const titleId = `question-batch-${item.name}-title`
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
                <CardHeader>
                  <QuestionnaireTitle id={titleId} render={<CardTitle />}>
                    {item.title}
                  </QuestionnaireTitle>
                  {item.description ? (
                    <QuestionnaireDescription render={<CardDescription />}>
                      {item.description}
                    </QuestionnaireDescription>
                  ) : null}
                  <CardAction>
                    <div className="flex items-center gap-2">
                      <QuestionnaireProgress
                        render={(props, state) => (
                          <div {...props}>
                            Question {state.current} of {state.total}
                          </div>
                        )}
                      />
                      {showCancel ? (
                        <CancelBatchButton
                          labels={labels}
                          onCancel={emitCancel}
                        />
                      ) : null}
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <QuestionnaireChoices className="gap-1">
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
                        !item.input &&
                        itemStatus[item.name] !== "answered" &&
                        !isSelected

                      return (
                        <QuestionBatchOptionRow
                          key={choice.value}
                          checked={isSelected}
                          disabled={pendingKey != null && !isPending}
                          isPending={isPending}
                          showHoverArrow={showHoverArrow}
                          value={choice.value}
                          onClick={() => {
                            if (item.multiple || !isSelected) return
                            clear()
                            clearItemSelection(item.name)
                          }}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked
                            const value = choice.value

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
                        </QuestionBatchOptionRow>
                      )
                    })}
                    {item.input ? (
                      <QuestionnaireInput
                        aria-label={item.input.label}
                        placeholder={item.input.placeholder}
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
            <CardHeader>
              <CardTitle>{labels?.review ?? "Review"}</CardTitle>
              <CardDescription>Submit this batch?</CardDescription>
              {showCancel ? (
                <CardAction>
                  <CancelBatchButton labels={labels} onCancel={emitCancel} />
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
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
        <CardFooter>
          <QuestionnaireActions className="w-full">
            {phase === "review" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="col-start-1 row-start-1 justify-self-start"
                  onClick={leaveReview}
                >
                  <ArrowLeftIcon data-icon="inline-start" />
                  {backLabel}
                </Button>
                <QuestionnaireSubmit>
                  {labels?.submit ?? "Submit"}
                </QuestionnaireSubmit>
              </>
            ) : (
              <>
                <QuestionnairePrevious>
                  <ArrowLeftIcon data-icon="inline-start" />
                  {backLabel}
                </QuestionnairePrevious>
                <QuestionnaireSkip
                  className={cn(pendingKey != null && "hidden")}
                  disabled={pendingKey != null}
                  onClick={() => {
                    if (!activeItem) return
                    clear()
                    clearItemSelection(activeItem)
                  }}
                >
                  {skipLabel}
                  {skipHasArrow ? (
                    <ArrowRightIcon data-icon="inline-end" />
                  ) : null}
                </QuestionnaireSkip>
                {showReviewNext ? (
                  hideAutoAdvanceNext ? null : (
                    <Button
                      type="button"
                      className="col-start-3 row-start-1 justify-self-end"
                      disabled={!hasAnswer}
                      onClick={enterReview}
                    >
                      {nextLabel}
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                  )
                ) : (
                  <>
                    {hideAutoAdvanceNext ? null : (
                      <QuestionnaireNext>
                        {nextLabel}
                        <ArrowRightIcon data-icon="inline-end" />
                      </QuestionnaireNext>
                    )}
                    <QuestionnaireSubmit>
                      {labels?.submit ?? "Submit"}
                    </QuestionnaireSubmit>
                  </>
                )}
              </>
            )}
          </QuestionnaireActions>
        </CardFooter>
      </Card>
    </Questionnaire>
  )
}
