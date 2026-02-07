import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateProjectName } from "@/lib/project-names";

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
  const { name, data } = body;

  if (!data || !Array.isArray(data)) {
    return NextResponse.json(
      { error: "Invalid project data" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();

  await db.insert(project).values({
    id,
    name: name || generateProjectName(),
    data,
    userId: session.user.id,
  });

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
  const { id, name } = body;

  if (!id || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const result = await db
    .update(project)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(and(eq(project.id, id), eq(project.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
