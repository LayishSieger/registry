import { cn } from "@/lib/utils"

/** Site mark from `app/icon.svg` — light rounded square + black L. */
export function LayishMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-6", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#F6F4EF" />
      <path fill="#1A1A1A" d="M9.5 7h6.2v11.2H23v6.3H9.5V7z" />
    </svg>
  )
}
