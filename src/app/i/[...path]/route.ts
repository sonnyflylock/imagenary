import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const SUPABASE_BUCKET_URL =
  "https://ozkzfovphykllpxhqixy.supabase.co/storage/v1/object/public/image-uploads";

// 60 requests per minute per IP
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { ok, remaining } = rateLimit(`img:${ip}`, RATE_LIMIT, RATE_WINDOW);

  if (!ok) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const { path } = await params;
  const filePath = path.join("/");

  // Block directory traversal
  if (filePath.includes("..") || filePath.includes("//")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabaseUrl = `${SUPABASE_BUCKET_URL}/${filePath}`;
  const res = await fetch(supabaseUrl);

  if (!res.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const body = res.body;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
      "Access-Control-Allow-Origin": "*",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
