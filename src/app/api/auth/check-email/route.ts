import { NextResponse, type NextRequest } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { canonicalize, isDisposable, validateEmailShape } from "@/lib/email-validation"

function admin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid", message: "Invalid request" }, { status: 400 })
  }

  const email = (body.email || "").trim()
  if (!validateEmailShape(email)) {
    return NextResponse.json(
      { ok: false, reason: "invalid", message: "Enter a valid email address." },
      { status: 200 }
    )
  }

  if (isDisposable(email)) {
    return NextResponse.json(
      {
        ok: false,
        reason: "disposable",
        message: "Temporary/disposable email providers aren't allowed. Use your regular email.",
      },
      { status: 200 }
    )
  }

  const canonical = canonicalize(email)
  if (!canonical) {
    return NextResponse.json(
      { ok: false, reason: "invalid", message: "Enter a valid email address." },
      { status: 200 }
    )
  }

  // Look for an existing account that resolves to the same inbox.
  const supabase = admin()
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("canonical_email", canonical)
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        reason: "duplicate",
        canonical,
        message: "An account with this email already exists. Try signing in instead.",
      },
      { status: 200 }
    )
  }

  return NextResponse.json({ ok: true, canonical }, { status: 200 })
}
