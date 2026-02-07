import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      totalProjects: sql<number>`count(*)::int`,
      totalSurfaces: sql<number>`coalesce(sum(jsonb_array_length(${project.data})), 0)::int`,
      storageEstimate: sql<number>`coalesce(sum(octet_length(${project.data}::text) + coalesce(octet_length(${project.thumbnail}), 0)), 0)::int`,
    })
    .from(project)
    .where(eq(project.userId, session.user.id));

  const stats = rows[0] ?? {
    totalProjects: 0,
    totalSurfaces: 0,
    storageEstimate: 0,
  };

  return NextResponse.json(stats);
}
