import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { searchTracks } from "@/features/deezer/client";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limitParam = searchParams.get("limit");
  const limit = Math.min(20, Math.max(1, Number(limitParam) || 8));

  if (!q.trim()) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const tracks = await searchTracks(q, limit);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("[deezer/search]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 502 },
    );
  }
}
