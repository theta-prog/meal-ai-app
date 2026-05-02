import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { mealLogEntries } from "@/db/schema";

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["朝食", "昼食", "夕食", "間食", "その他"]),
  description: z.string().min(1).max(500),
  calories: z.number().int().min(1).max(9999).optional(),
  recipeId: z.string().optional(),
  loggedAt: z.string().datetime(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const db = getDb();
  const rows = await db.query.mealLogEntries.findMany({
    where: date
      ? and(eq(mealLogEntries.userId, session.user.id), eq(mealLogEntries.date, date))
      : eq(mealLogEntries.userId, session.user.id),
    orderBy: (t, { desc }) => desc(t.loggedAt),
  });

  return Response.json(rows);
}

export async function POST(req: Request) {
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

  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "入力値が不正です", details: parsed.error.flatten() }, { status: 400 });
  }

  const { loggedAt, ...rest } = parsed.data;
  const entry = {
    ...rest,
    id: crypto.randomUUID(),
    userId: session.user.id,
    loggedAt: new Date(loggedAt),
  };

  const db = getDb();
  await db.insert(mealLogEntries).values(entry);

  return Response.json(
    { ...entry, loggedAt: entry.loggedAt.toISOString() },
    { status: 201 }
  );
}
