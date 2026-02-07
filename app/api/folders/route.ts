import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { folder } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folders = await db
    .select()
    .from(folder)
    .where(eq(folder.userId, session.user.id));

  return NextResponse.json(folders);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = crypto.randomUUID();

  await db.insert(folder).values({
    id,
    name: name.trim(),
    userId: session.user.id,
  });

  return NextResponse.json({ id, name: name.trim() }, { status: 201 });
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

  if (!id || !name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await db
    .update(folder)
    .set({ name: name.trim(), updatedAt: new Date() })
    .where(and(eq(folder.id, id), eq(folder.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const result = await db
    .delete(folder)
    .where(and(eq(folder.id, id), eq(folder.userId, session.user.id)));

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
