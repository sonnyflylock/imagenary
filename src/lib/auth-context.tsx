"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "./supabase"
import type { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js"

export interface User {
  id: string
  email: string
  balanceCents: number
  lifetimeUses: number
  freeExtract: number
  freeRefresh: number
  freeTouchup: number
  freeGenerate: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapProfile(authUser: SupabaseUser, profile: Record<string, unknown> | null): User {
  return {
    id: authUser.id,
    email: authUser.email || "",
    balanceCents: (profile?.balance_cents as number) || 0,
    lifetimeUses: (profile?.lifetime_uses as number) || 0,
    freeExtract: (profile?.free_extract as number) || 0,
    freeRefresh: (profile?.free_refresh as number) || 0,
    freeTouchup: (profile?.free_touchup as number) || 0,
    freeGenerate: (profile?.free_generate as number) || 0,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session on mount (client-side only)
  useEffect(() => {
    let supabase: ReturnType<typeof createClient>
    try {
      supabase = createClient()
    } catch {
      setIsLoading(false)
      return
    }

    const loadProfile = async (authUser: SupabaseUser) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()
      setUser(mapProfile(authUser, data))
    }

    supabase.auth.getUser().then(({ data: { user: authUser } }: { data: { user: SupabaseUser | null } }) => {
      if (authUser) {
        loadProfile(authUser).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          loadProfile(session.user)
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const signup = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(error.message)
  }

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = "/signin"
  }

  const refreshProfile = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()
      setUser(mapProfile(authUser, data))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
