import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Imagenary AI — free to start, pay only for what you use.",
  robots: { index: false, follow: false },
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children
}
