"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import type {
  QuestionBatchItem,
  QuestionBatchResult,
} from "@/registry/new-york/blocks/question-batch/question-batch"
import { QuestionBatch } from "@/registry/new-york/blocks/question-batch/question-batch"

const defaultItems: QuestionBatchItem[] = [
  {
    name: "direction",
    title: "Which direction?",
    description: "Use Next to continue.",
    required: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
      { value: "review", label: "Review what exists" },
    ],
  },
  {
    name: "notes",
    title: "Anything else?",
    description: "Skip, pick one, or write your own.",
    choices: [
      { value: "deadline", label: "There is a deadline" },
      { value: "constraints", label: "There are constraints" },
    ],
    input: {
      label: "Another note",
      placeholder: "Other…",
    },
  },
]

const autoAdvanceItems: QuestionBatchItem[] = [
  {
    name: "direction",
    title: "Which direction?",
    description: "This slide sets autoAdvance.",
    required: true,
    autoAdvance: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
      { value: "review", label: "Review what exists" },
    ],
  },
  {
    name: "include",
    title: "What should we include?",
    description: "Multiple choice has no autoAdvance. Use Next.",
    required: true,
    multiple: true,
    choices: [
      { value: "summary", label: "Summary" },
      { value: "examples", label: "Examples" },
      { value: "risks", label: "Risks" },
    ],
  },
  {
    name: "notes",
    title: "Anything else?",
    description: "Last slide stays on Submit unless review is on.",
    choices: [
      { value: "deadline", label: "There is a deadline" },
      { value: "constraints", label: "There are constraints" },
    ],
    input: {
      label: "Another note",
      placeholder: "Other…",
    },
  },
]

const reviewItems: QuestionBatchItem[] = [
  {
    name: "direction",
    title: "Which direction?",
    description: "This slide auto-advances.",
    required: true,
    autoAdvance: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
      { value: "review", label: "Review what exists" },
    ],
  },
  {
    name: "notes",
    title: "Anything else?",
    description: "Last slide auto-advances to review.",
    autoAdvance: true,
    choices: [
      { value: "deadline", label: "There is a deadline" },
      { value: "constraints", label: "There are constraints" },
    ],
    input: {
      label: "Another note",
      placeholder: "Other…",
    },
  },
]

function summarizeResult(result: QuestionBatchResult) {
  if (result.status === "canceled") return "canceled"
  return result.answers
    .map((answer) => `${answer.name}: ${answer.label}`)
    .join(" · ")
}

function PreviewBatch({
  items,
  review = false,
  cancel = false,
}: {
  items: QuestionBatchItem[]
  review?: boolean
  cancel?: boolean
}) {
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">{submitted}</p>
        <Button type="button" variant="outline" onClick={() => setSubmitted(null)}>
          Replay
        </Button>
      </div>
    )
  }

  return (
    <QuestionBatch
      items={items}
      review={review}
      cancel={cancel}
      onResult={(result) => setSubmitted(summarizeResult(result))}
    />
  )
}

export function QuestionBatchDefaultPreview() {
  return <PreviewBatch items={defaultItems} />
}

export function QuestionBatchAutoAdvancePreview() {
  return <PreviewBatch items={autoAdvanceItems} />
}

export function QuestionBatchReviewPreview() {
  return <PreviewBatch items={reviewItems} review />
}

export function QuestionBatchCancelPreview() {
  return <PreviewBatch items={reviewItems} review cancel />
}

const HITL_SNIPPET = `const { addToolOutput } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
})

<QuestionBatch
  cancel
  review
  items={part.input.items}
  onResult={(output) =>
    addToolOutput({
      tool: "askQuestions",
      toolCallId: part.toolCallId,
      output,
    })
  }
/>`

export function QuestionBatchHitlPreview() {
  const [result, setResult] = React.useState<QuestionBatchResult | null>(null)

  if (result) {
    const payload = {
      tool: "askQuestions",
      toolCallId: "call_askQuestions_1",
      output: result,
    }

    return (
      <div className="flex w-full flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          This is what the host sends. Not a user message — it resolves the
          paused tool and the chat route continues.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
          {`addToolOutput(${JSON.stringify(payload, null, 2)})`}
        </pre>
        <Button type="button" variant="outline" onClick={() => setResult(null)}>
          Replay
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Agent called askQuestions and is waiting. Submit or cancel fills the
        tool result.
      </p>
      <QuestionBatch
        cancel
        review
        items={reviewItems}
        onResult={setResult}
      />
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs">
        {HITL_SNIPPET}
      </pre>
    </div>
  )
}
