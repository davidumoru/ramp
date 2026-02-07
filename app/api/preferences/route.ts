import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { editorPreference } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS = {
  defaultSegments: 32,
  defaultWireframe: false,
  defaultBezier: false,
  autoSave: false,
  autoSaveInterval: 30,
};

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(editorPreference)
    .where(eq(editorPreference.userId, session.user.id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ userId: session.user.id, ...DEFAULTS });
  }

  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const defaultSegments = Math.min(
    Math.max(parseInt(body.defaultSegments, 10) || 32, 4),
    64
  );
  const defaultWireframe = !!body.defaultWireframe;
  const defaultBezier = !!body.defaultBezier;
  const autoSave = !!body.autoSave;
  const autoSaveInterval = Math.min(
    Math.max(parseInt(body.autoSaveInterval, 10) || 30, 5),
    300
  );

  const values = {
    userId: session.user.id,
    defaultSegments,
    defaultWireframe,
    defaultBezier,
    autoSave,
    autoSaveInterval,
    updatedAt: new Date(),
  };

  await db
    .insert(editorPreference)
    .values(values)
    .onConflictDoUpdate({
      target: editorPreference.userId,
      set: {
        defaultSegments,
        defaultWireframe,
        defaultBezier,
        autoSave,
        autoSaveInterval,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}
