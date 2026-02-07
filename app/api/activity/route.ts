import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activityEvent } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 1),
    100
  );

  const events = await db
    .select()
    .from(activityEvent)
    .where(eq(activityEvent.userId, session.user.id))
    .orderBy(desc(activityEvent.createdAt))
    .limit(limit);

  return NextResponse.json(events);
}
