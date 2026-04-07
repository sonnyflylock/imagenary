import { Check } from "lucide-react"

export const metadata = { title: "Credits Added | Imagenary.ai" }

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-accent/10">
        <Check className="size-8 text-accent" />
      </div>
      <h1 className="text-2xl font-bold">Credits added!</h1>
      <p className="mt-3 text-muted-foreground">
        Your credits are ready to use across all Imagenary tools.
      </p>
      <a
        href="/app/refresh"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-accent px-6 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Start using your credits
      </a>
    </div>
  )
}
