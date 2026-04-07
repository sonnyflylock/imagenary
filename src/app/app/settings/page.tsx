"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Key, Plus, Trash2, Copy, Check, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react"

interface ApiKey {
  id: number
  key_prefix: string
  name: string
  created_at: string
  last_used_at: string | null
  revoked: boolean
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [revoking, setRevoking] = useState<number | null>(null)

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys")
    if (res.ok) {
      const data = await res.json()
      setKeys(data.keys)
    }
    setLoadingKeys(false)
  }, [])

  useEffect(() => {
    if (user) fetchKeys()
  }, [user, fetchKeys])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.push("/signin")
    return null
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() || "Default" }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewKey(data.key)
        setKeyName("")
        fetchKeys()
      } else {
        alert(data.error || "Failed to create key")
      }
    } catch {
      alert("Failed to create key")
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm("Revoke this API key? Any integrations using it will stop working.")) return
    setRevoking(id)
    try {
      await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      fetchKeys()
    } finally {
      setRevoking(null)
    }
  }

  function handleCopyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeKeys = keys.filter((k) => !k.revoked)
  const revokedKeys = keys.filter((k) => k.revoked)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage your API keys and account details.
      </p>

      {/* Account info */}
      <div className="rounded-xl border p-5 mb-8">
        <h2 className="text-sm font-semibold mb-3">Account</h2>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-medium">${(user.balanceCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lifetime uses</span>
            <span>{user.lifetimeUses}</span>
          </div>
        </div>
      </div>

      {/* New key just created */}
      {newKey && (
        <div className="rounded-xl border-2 border-accent bg-accent/5 p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Your new API key</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Copy this key now — you won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs font-mono break-all">
                  {showKey ? newKey : newKey.slice(0, 12) + "•".repeat(24)}
                </code>
                <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopyKey}>
                  {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setNewKey(null)}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Key className="size-4" />
              API Keys
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Use API keys to access Imagenary tools from your own code.
            </p>
          </div>
        </div>

        {/* Create new key */}
        {!newKey && (
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Key name (optional)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Button
              variant="accent"
              size="sm"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Key
                </>
              )}
            </Button>
          </div>
        )}

        {/* Active keys */}
        {loadingKeys ? (
          <div className="py-8 text-center">
            <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : activeKeys.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No API keys yet. Create one to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {activeKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground">{k.key_prefix}...</code>
                    <span className="text-sm font-medium">{k.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Created {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at && (
                      <> · Last used {new Date(k.last_used_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(k.id)}
                  disabled={revoking === k.id}
                  className="text-destructive hover:text-destructive"
                >
                  {revoking === k.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Revoked keys */}
        {revokedKeys.length > 0 && (
          <details className="mt-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              {revokedKeys.length} revoked key{revokedKeys.length > 1 ? "s" : ""}
            </summary>
            <div className="mt-2 space-y-1">
              {revokedKeys.map((k) => (
                <div key={k.id} className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2 opacity-50">
                  <code className="text-xs font-mono">{k.key_prefix}...</code>
                  <span className="text-xs">{k.name}</span>
                  <span className="ml-auto text-xs text-destructive">Revoked</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Usage with API */}
      <div className="mt-8 rounded-xl border bg-muted/20 p-5">
        <h3 className="text-sm font-semibold mb-2">Quick start</h3>
        <div className="rounded-lg border bg-zinc-950 p-4 overflow-x-auto">
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre">{`curl -X POST https://www.imagenary.ai/api/image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@photo.jpg" \\
  -F "tool=extract" \\
  -F "model=gemini"`}</pre>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          See the <a href="/api-docs" className="text-accent hover:underline">full API docs</a> for all endpoints and parameters.
        </p>
      </div>
    </div>
  )
}
