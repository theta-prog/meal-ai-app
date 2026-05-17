import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { userGoals } from "@/db/schema";
import { userGoalSchema } from "@/lib/goal-schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const db = getDb();
  const goal = await db.query.userGoals.findFirst({
    where: eq(userGoals.userId, session.user.id),
  });

  return Response.json(goal ?? null);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "リクエストのJSONが不正です" }, { status: 400 });
  }

  const parsed = userGoalSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "入力値が不正です", details: parsed.error.flatten() }, { status: 400 });
  }

  const now = new Date();
  const db = getDb();
  await db
    .insert(userGoals)
    .values({ ...parsed.data, userId: session.user.id, updatedAt: now })
    .onConflictDoUpdate({
      target: userGoals.userId,
      set: { ...parsed.data, updatedAt: now },
    });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const db = getDb();
  await db.delete(userGoals).where(eq(userGoals.userId, session.user.id));

  return Response.json({ ok: true });
}
