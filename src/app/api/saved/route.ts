import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { savedContents } from "@/db/schema";
import { detectSavedContentKind, extractSavedContentTitle } from "@/lib/saved-content";

const savedSchema = z.object({
  content: z.string().min(1),
  savedAt: z.string().datetime(),
});

const kindFilter = z.enum(["recipe", "shopping-list"]).optional();

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const kind = kindFilter.parse(searchParams.get("kind") ?? undefined);

  const db = getDb();
  const rows = await db.query.savedContents.findMany({
    where: kind
      ? and(eq(savedContents.userId, session.user.id), eq(savedContents.kind, kind))
      : eq(savedContents.userId, session.user.id),
    orderBy: (t, { desc }) => desc(t.savedAt),
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

  const parsed = savedSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "入力値が不正です", details: parsed.error.flatten() }, { status: 400 });
  }

  const { content, savedAt } = parsed.data;
  const detected = detectSavedContentKind(content);
  const kind = detected === "none" ? "recipe" : detected;
  const item = {
    id: crypto.randomUUID(),
    userId: session.user.id,
    kind,
    title: extractSavedContentTitle(content, kind),
    content,
    savedAt: new Date(savedAt),
  };

  const db = getDb();
  await db.insert(savedContents).values(item);

  return Response.json(
    { ...item, savedAt: item.savedAt.toISOString() },
    { status: 201 }
  );
}
