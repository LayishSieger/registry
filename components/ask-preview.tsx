"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import type {
  AskItem,
  AskResult,
} from "@/registry/new-york/blocks/ask/ask"
import { Ask } from "@/registry/new-york/blocks/ask/ask"

const defaultItems: AskItem[] = [
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
    description: "Skip, pick one, or type Other and press Enter to save.",
    choices: [
      { value: "deadline", label: "There is a deadline" },
      { value: "constraints", label: "There are constraints" },
    ],
    input: {
      label: "Another note",
      placeholder: "Other",
    },
  },
]

const autoAdvanceItems: AskItem[] = [
  {
    name: "direction",
    title: "Which direction?",
    description: "First pick auto-advances. Other commits on Enter.",
    required: true,
    autoAdvance: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
      { value: "review", label: "Review what exists" },
    ],
    input: {
      label: "Another direction",
      placeholder: "Other",
    },
  },
  {
    name: "include",
    title: "What should we include?",
    description: "Multiple choice has no autoAdvance. Other saves with a check.",
    required: true,
    multiple: true,
    choices: [
      { value: "summary", label: "Summary" },
      { value: "examples", label: "Examples" },
      { value: "risks", label: "Risks" },
    ],
    input: {
      label: "Something else to include",
      placeholder: "Other",
    },
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
      placeholder: "Other",
    },
  },
]

const reviewItems: AskItem[] = [
  {
    name: "direction",
    title: "Which direction?",
    description: "First pick auto-advances. Other commits on Enter.",
    required: true,
    autoAdvance: true,
    choices: [
      { value: "clarify", label: "Ask a clarifying question" },
      { value: "draft", label: "Draft a first version" },
      { value: "review", label: "Review what exists" },
    ],
    input: {
      label: "Another direction",
      placeholder: "Other",
    },
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
      placeholder: "Other",
    },
  },
]

function summarizeResult(result: AskResult) {
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
  items: AskItem[]
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
    <Ask
      items={items}
      review={review}
      cancel={cancel}
      onResult={(result) => setSubmitted(summarizeResult(result))}
    />
  )
}

export function AskDefaultPreview() {
  return <PreviewBatch items={defaultItems} />
}

export function AskAutoAdvancePreview() {
  return <PreviewBatch items={autoAdvanceItems} />
}

export function AskReviewPreview() {
  return <PreviewBatch items={reviewItems} review />
}

export function AskCancelPreview() {
  return <PreviewBatch items={reviewItems} review cancel />
}

export function AskHitlPreview() {
  const [result, setResult] = React.useState<AskResult | null>(null)

  if (result) {
    const payload = {
      tool: "ask",
      toolCallId: "call_ask_1",
      output: result,
    }

    return (
      <div className="flex w-full flex-col gap-4">
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
    <Ask
      cancel
      review
      items={reviewItems}
      onResult={setResult}
    />
  )
}
