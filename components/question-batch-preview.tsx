"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import type { QuestionBatchItem } from "@/registry/new-york/blocks/question-batch/question-batch"
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

function PreviewBatch({
  items,
  review = false,
}: {
  items: QuestionBatchItem[]
  review?: boolean
}) {
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const parts = items.map((item) => {
      const value = item.multiple
        ? data.getAll(item.name).join(", ") || "—"
        : data.get(item.name)?.toString() || "Skipped"
      return `${item.name}: ${value}`
    })
    setSubmitted(parts.join(" · "))
  }

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
    <QuestionBatch items={items} review={review} onSubmit={handleSubmit} />
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
