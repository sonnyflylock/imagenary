import { NextRequest, NextResponse } from "next/server";

const SUPABASE_BUCKET_URL =
  "https://ozkzfovphykllpxhqixy.supabase.co/storage/v1/object/public/image-uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join("/");
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
    },
  });
}
