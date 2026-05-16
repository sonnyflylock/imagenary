import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUserId, downloadMediaItem } from "@/lib/google-photos"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const { id } = await params
  try {
    const { bytes, mimeType, filename } = await downloadMediaItem(userId, id)
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
        "Cache-Control": "private, max-age=60",
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to download media"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
