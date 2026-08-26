"use client"

import * as React from "react"

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
      /** After a single choice, go to the next slide. Not valid on `multiple`. */
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
}

export type QuestionBatchProps = {
  items: QuestionBatchItem[]
  className?: string
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
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

export function QuestionBatch({
  items,
  className,
  onSubmit,
  autoAdvanceDelay = DEFAULT_AUTO_ADVANCE_DELAY_MS,
  shortcuts = "numbers",
  labels,
  defaultItem,
  item: itemProp,
  onItemChange,
}: QuestionBatchProps) {
  const firstName = items[0]?.name ?? ""
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

  function goToNextFrom(fromName: string) {
    if (activeItemRef.current !== fromName) return
    const index = items.findIndex((item) => item.name === fromName)
    const next = items[index + 1]
    if (next) setActiveItem(next.name)
  }

  const collection = items.map((item) => ({
    name: item.name,
    required: item.required,
    choices: item.choices.map((choice) => ({ value: choice.value })),
  }))

  return (
    <Questionnaire
      className={cn("w-full", className)}
      defaultItem={defaultItem}
      item={activeItem || undefined}
      items={collection}
      shortcuts={shortcuts === false ? undefined : shortcuts}
      onItemChange={handleItemChange}
      onSubmit={onSubmit}
    >
      <Card>
        {items.map((item) => {
          const titleId = `question-batch-${item.name}-title`
          const canAutoAdvance = itemAutoAdvances(item)
          const hasNext =
            items.findIndex((entry) => entry.name === item.name) <
            items.length - 1

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
                  <QuestionnaireProgress
                    render={(props, state) => (
                      <div {...props}>
                        Question {state.current} of {state.total}
                      </div>
                    )}
                  />
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
                        className={cn(
                          isPending && "ring-1 ring-primary/50",
                        )}
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
        <CardFooter>
          <QuestionnaireActions className="w-full">
            <QuestionnairePrevious>{labels?.previous}</QuestionnairePrevious>
            <QuestionnaireSkip>{labels?.skip}</QuestionnaireSkip>
            <QuestionnaireNext>{labels?.next ?? "Next"}</QuestionnaireNext>
            <QuestionnaireSubmit>
              {labels?.submit ?? "Submit"}
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </CardFooter>
      </Card>
    </Questionnaire>
  )
}
