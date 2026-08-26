"use client"

import * as React from "react"
import { ArrowLeftIcon, XIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  QuestionnaireChoice,
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

export type QuestionBatchProps = {
  items: QuestionBatchItem[]
  className?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
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

type ReviewAnswer = {
  name: string
  title: string
  label: string
}

function itemAutoAdvances(item: QuestionBatchItem) {
  if (item.multiple) return false
  return item.autoAdvance === true
}

function readAnswers(
  form: HTMLFormElement,
  items: QuestionBatchItem[],
): ReviewAnswer[] {
  const data = new FormData(form)

  return items.map((item) => {
    if (item.multiple) {
      const values = data.getAll(item.name).map(String).filter(Boolean)
      if (values.length === 0) {
        return { name: item.name, title: item.title, label: "Skipped" }
      }
      const labels = values.map(
        (value) =>
          item.choices.find((choice) => choice.value === value)?.label ?? value,
      )
      return { name: item.name, title: item.title, label: labels.join(", ") }
    }

    const value = data.get(item.name)?.toString() ?? ""
    if (!value) {
      return { name: item.name, title: item.title, label: "Skipped" }
    }
    const choice = item.choices.find((entry) => entry.value === value)
    return {
      name: item.name,
      title: item.title,
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
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels?.cancel ?? "Cancel batch"}
        >
          <XIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {labels?.cancelTitle ?? "Cancel this batch?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {labels?.cancelDescription ??
              "Your current answers in this batch will be discarded."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {labels?.cancelKeep ?? "Keep answering"}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onCancel?.()}>
            {labels?.cancelConfirm ?? "Cancel batch"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function QuestionBatch({
  items,
  className,
  onSubmit,
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
  const [reviewAnswers, setReviewAnswers] = React.useState<ReviewAnswer[]>([])
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
      setReviewAnswers(readAnswers(formRef.current, items))
    }
    setPhase("review")
  }

  function leaveReview() {
    setPhase("questions")
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Skip on the last item calls form.requestSubmit(). Intercept that
    // while questions are still open so review is not bypassed.
    if (review && phase === "questions") {
      event.preventDefault()
      enterReview()
      return
    }
    onSubmit?.(event)
  }

  const collection = items.map((item) => ({
    name: item.name,
    required: item.required,
    choices: item.choices.map((choice) => ({ value: choice.value })),
  }))

  const showReviewNext =
    review && phase === "questions" && activeItem === lastName
  const showCancel = cancel

  return (
    <Questionnaire
      ref={formRef}
      className={cn("w-full", className)}
      defaultItem={defaultItem}
      item={activeItem || undefined}
      items={collection}
      shortcuts={shortcuts === false ? undefined : shortcuts}
      onItemChange={handleItemChange}
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
                          onCancel={onCancel}
                        />
                      ) : null}
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <QuestionnaireChoices>
                    {item.choices.map((choice) => {
                      const choiceKey = `${item.name}:${choice.value}`
                      const isPending = pendingKey === choiceKey

                      return (
                        <QuestionnaireChoice
                          key={choice.value}
                          className={cn(isPending && "ring-1 ring-primary/50")}
                          value={choice.value}
                          onChange={(event) => {
                            if (!event.currentTarget.checked) {
                              clear()
                              return
                            }
                            if (!canAutoAdvance || !hasNext) return
                            schedule(choiceKey, () => goToNextFrom(item.name))
                          }}
                        >
                          {choice.label}
                        </QuestionnaireChoice>
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
                  <CancelBatchButton labels={labels} onCancel={onCancel} />
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
                  {labels?.previous ?? "Back"}
                </Button>
                <QuestionnaireSubmit>
                  {labels?.submit ?? "Submit"}
                </QuestionnaireSubmit>
              </>
            ) : (
              <>
                <QuestionnairePrevious>
                  {labels?.previous}
                </QuestionnairePrevious>
                <QuestionnaireSkip>{labels?.skip}</QuestionnaireSkip>
                {showReviewNext ? (
                  <Button
                    type="button"
                    className="col-start-3 row-start-1 justify-self-end"
                    onClick={enterReview}
                  >
                    {labels?.next ?? "Next"}
                  </Button>
                ) : (
                  <>
                    <QuestionnaireNext>
                      {labels?.next ?? "Next"}
                    </QuestionnaireNext>
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
