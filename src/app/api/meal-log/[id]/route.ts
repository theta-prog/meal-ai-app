import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { mealLogEntries } from "@/db/schema";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();

  // where 句に userId を必ず含めて他人のデータを削除できないようにする
  const result = await db
    .delete(mealLogEntries)
    .where(and(eq(mealLogEntries.id, id), eq(mealLogEntries.userId, session.user.id)))
    .returning({ id: mealLogEntries.id });

  if (result.length === 0) {
    return Response.json({ error: "見つかりません" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
