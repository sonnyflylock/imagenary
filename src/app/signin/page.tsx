"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

type Mode = "signin" | "signup"

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

function SignInForm() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { user, login, signup } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/app"

  // Redirect if already signed in
  if (user) {
    router.push(nextPath)
    return null
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${nextPath}`,
      },
    })
    if (error) setError(error.message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      setIsLoading(true)
      try {
        await signup(email, password)
        setInfo("Check your email to confirm your account, then sign in.")
        setMode("signin")
        setPassword("")
        setConfirmPassword("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create account.")
      } finally {
        setIsLoading(false)
      }
      return
    }

    // Sign in
    setIsLoading(true)
    try {
      await login(email, password)
      router.push(nextPath)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed"
      const lower = msg.toLowerCase()

      if (lower.includes("invalid login credentials") || lower.includes("no account") || lower.includes("user not found")) {
        setMode("signup")
        setError("No account with that email — create one below.")
        setPassword("")
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold">Sign in to Imagenary AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Free to start, pay only for what you use.
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-border text-foreground font-medium py-3 px-4 rounded-lg hover:bg-muted transition-colors mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-sm">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && error && error.includes("No account") && (
            <div className="text-accent text-sm">{error}</div>
          )}

          <div>
            <label className="block text-muted-foreground text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (mode === "signup") {
                  setMode("signin")
                  setError("")
                }
              }}
              className="w-full bg-transparent border-b border-border text-foreground py-2 focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-muted-foreground text-sm mb-2">
              {mode === "signup" ? "Create Password" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-border text-foreground py-2 focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-muted-foreground text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b border-border text-foreground py-2 focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && !(mode === "signup" && error.includes("No account")) && (
            <div className="text-sm text-red-400">{error}</div>
          )}

          {info && <div className="text-sm text-accent">{info}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                {mode === "signup" ? "Create Account" : "Sign In"}
                <ArrowRight className="size-3" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
