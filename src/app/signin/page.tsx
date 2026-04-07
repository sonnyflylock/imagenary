"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight } from "lucide-react"

type Mode = "signin" | "signup"

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login, signup } = useAuth()
  const router = useRouter()

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

    setIsLoading(true)
    try {
      await login(email, password)
      router.push("/app/refresh")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "Sign in to Imagenary" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "5 free uses per tool to start."
              : "Get started with 5 free uses per tool."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-muted-foreground text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {error && <div className="text-sm text-red-400">{error}</div>}
          {info && <div className="text-sm text-accent">{info}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            {!isLoading && <ArrowRight className="size-3" />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => { setMode("signup"); setError(""); setInfo("") }}
                className="text-accent hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("signin"); setError(""); setInfo("") }}
                className="text-accent hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
