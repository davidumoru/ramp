import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";

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
    name: name || "Untitled Project",
    data,
    userId: session.user.id,
  });

  return NextResponse.json({ id }, { status: 201 });
}
