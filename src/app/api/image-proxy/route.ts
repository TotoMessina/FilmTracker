import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Security check: only allow TMDB image domain
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("themoviedb.org") && !parsed.hostname.endsWith("tmdb.org")) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        Accept: "image/*",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return new NextResponse(`Image fetch error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err?.message || "unknown"}`, { status: 500 });
  }
}
