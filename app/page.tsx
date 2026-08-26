import { QuestionBatchAutoAdvancePreview } from "@/components/question-batch-preview"
import { QuestionBatchDefaultPreview } from "@/components/question-batch-preview"
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
          description="question-batch — Next and Submit only."
        >
          <QuestionBatchDefaultPreview />
        </RegistryExample>
        <RegistryExample
          title="Auto-advance"
          description="autoAdvance is per slide. Off for multiple choice and for the last slide."
        >
          <QuestionBatchAutoAdvancePreview />
        </RegistryExample>
        <RegistryExample
          title="Review"
          description="review on the batch. Last-slide autoAdvance goes to review, not submit."
        >
          <QuestionBatchReviewPreview />
        </RegistryExample>
      </main>
    </div>
  )
}
