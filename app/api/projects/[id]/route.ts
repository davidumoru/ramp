import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, activityEvent } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const rows = await db
    .select()
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { data, thumbnail, name } = body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (data && Array.isArray(data)) {
    updates.data = data;
  }

  if (thumbnail !== undefined) {
    updates.thumbnail = thumbnail || null;
  }

  if (typeof name === "string" && name.trim().length > 0) {
    updates.name = name.trim();
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const result = await db
    .update(project)
    .set(updates)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Log activity
  const nameForLog =
    (updates.name as string) ??
    (
      await db
        .select({ name: project.name })
        .from(project)
        .where(eq(project.id, id))
        .limit(1)
    )[0]?.name ??
    "Unknown";

  await db.insert(activityEvent).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    action: "updated",
    projectId: id,
    projectName: nameForLog,
  });

  return NextResponse.json({ ok: true });
}
