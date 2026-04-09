import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export async function GET() {
  const zipPath = path.join(process.cwd(), "screenscribe.zip")

  try {
    const file = await readFile(zipPath)
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="screenscribe.zip"',
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Download not available yet. Please try again later." },
      { status: 404 }
    )
  }
}
