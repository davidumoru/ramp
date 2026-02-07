import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, activityEvent } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateProjectName } from "@/lib/project-names";

async function logActivity(
  userId: string,
  action: string,
  projectId: string | null,
  projectName: string
) {
  await db.insert(activityEvent).values({
    id: crypto.randomUUID(),
    userId,
    action,
    projectId,
    projectName,
  });
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db
    .select({
      id: project.id,
      name: project.name,
      thumbnail: project.thumbnail,
      folderId: project.folderId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })
    .from(project)
    .where(eq(project.userId, session.user.id))
    .orderBy(desc(project.createdAt));

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, data, thumbnail, action } = body;

  if (!data || !Array.isArray(data)) {
    return NextResponse.json(
      { error: "Invalid project data" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const projectName = name || generateProjectName();

  await db.insert(project).values({
    id,
    name: projectName,
    data,
    thumbnail: thumbnail || null,
    userId: session.user.id,
  });

  await logActivity(
    session.user.id,
    action === "duplicated" || action === "imported" ? action : "created",
    id,
    projectName
  );

  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, folderId } = body;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof name === "string" && name.trim().length > 0) {
    updates.name = name.trim();
  }

  if (folderId !== undefined) {
    updates.folderId = folderId || null;
  }

  if (Object.keys(updates).length === 1) {
    // Only updatedAt, nothing meaningful to update
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const result = await db
    .update(project)
    .set(updates)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Log activity for rename
  if (updates.name) {
    await logActivity(session.user.id, "updated", id, updates.name as string);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Query project name before deleting for activity log
  const rows = await db
    .select({ name: project.name })
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const projectName = rows[0].name;

  const result = await db
    .delete(project)
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logActivity(session.user.id, "deleted", null, projectName);

  return NextResponse.json({ ok: true });
}
