import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getTrack } from "@/features/deezer/client";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const track = await getTrack(numericId);
    if (!track) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ track });
  } catch (err) {
    console.error("[deezer/track]", err);
    return NextResponse.json(
      { error: "Lookup failed" },
      { status: 502 },
    );
  }
}
