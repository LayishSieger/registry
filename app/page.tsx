import { QuestionBatchAutoAdvancePreview } from "@/components/question-batch-preview"
import { QuestionBatchCancelPreview } from "@/components/question-batch-preview"
import { QuestionBatchDefaultPreview } from "@/components/question-batch-preview"
import { QuestionBatchHitlPreview } from "@/components/question-batch-preview"
import { QuestionBatchReviewPreview } from "@/components/question-batch-preview"
import { RegistryExample } from "@/components/registry-example"

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">layish</h1>
        <p className="text-muted-foreground">
          A registry of composed blocks on top of shadcn.
        </p>
      </header>
      <main className="flex flex-1 flex-col gap-8">
        <RegistryExample
          name="question-batch"
          title="Default"
          description="Next and Submit. Other is a row — Enter commits, it is not an answer while typing."
        >
          <QuestionBatchDefaultPreview />
        </RegistryExample>
        <RegistryExample
          title="Auto-advance"
          description="First pick auto-advances. Other Enter commits and advances. After Back, Next comes back."
        >
          <QuestionBatchAutoAdvancePreview />
        </RegistryExample>
        <RegistryExample
          title="Review"
          description="review on the batch. Last-slide autoAdvance and Other commit go to review, not submit."
        >
          <QuestionBatchReviewPreview />
        </RegistryExample>
        <RegistryExample
          title="Cancel"
          description="cancel on the batch. Confirm before discarding answers."
        >
          <QuestionBatchCancelPreview />
        </RegistryExample>
        <RegistryExample
          title="AI SDK HITL"
          description="onResult is the tool output. Host passes it to addToolOutput."
        >
          <QuestionBatchHitlPreview />
        </RegistryExample>
      </main>
    </div>
  )
}
