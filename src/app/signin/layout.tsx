import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Imagenary.ai — 5 free uses of every AI image tool. No credit card required.",
  robots: { index: false, follow: false },
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children
}
