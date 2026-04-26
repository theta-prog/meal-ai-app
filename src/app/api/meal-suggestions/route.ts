import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { generateMealPlan } from "@/lib/gemini";
import type { MealGoal } from "@/types/meal";

// Node.js runtime: @google/genai の node ビルドを正しく使うため
// Cloudflare Pages では nodejs_compat フラグを有効にすること
export const runtime = "nodejs";

const weightModeSchema = z.object({
  mode: z.literal("weight"),
  currentWeight: z.number().min(20).max(300),
  targetWeight: z.number().min(20).max(300),
  timeframeWeeks: z.number().min(1).max(52).default(12),
});

const caloriesModeSchema = z.object({
  mode: z.literal("calories"),
  targetCalories: z.number().min(800).max(5000),
});

const bulkModeSchema = z.object({
  mode: z.literal("bulk"),
  currentWeight: z.number().min(20).max(300),
  trainingDaysPerWeek: z.number().min(1).max(7),
});

const requestSchema = z.discriminatedUnion("mode", [
  weightModeSchema,
  caloriesModeSchema,
  bulkModeSchema,
]);

function calcWeightLossCalories(
  input: z.infer<typeof weightModeSchema>
): number {
  const deficit =
    ((input.currentWeight - input.targetWeight) * 7700) /
    (input.timeframeWeeks * 7);
  return Math.max(1200, Math.min(3000, Math.round(2000 - deficit)));
}

function calcBulkCalories(
  input: z.infer<typeof bulkModeSchema>
): { calories: number; proteinTargetG: number } {
  const activityMultiplier =
    input.trainingDaysPerWeek <= 2
      ? 1.375
      : input.trainingDaysPerWeek <= 4
        ? 1.55
        : 1.725;
  // Simplified TDEE: weight × 24 (BMR) × activity factor
  const tdee = Math.round(input.currentWeight * 24 * activityMultiplier);
  const calories = Math.min(4500, tdee + 300);
  const proteinTargetG = Math.round(input.currentWeight * 2);
  return { calories, proteinTargetG };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストのJSONが不正です" },
      { status: 400 }
    );
  }

  let input: z.infer<typeof requestSchema>;
  try {
    input = requestSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "入力値が不正です", details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "入力値が不正です" }, { status: 400 });
  }

  let targetCalories: number;
  let goal: MealGoal;
  let proteinTargetG: number | undefined;

  if (input.mode === "calories") {
    targetCalories = input.targetCalories;
    goal = "loss";
  } else if (input.mode === "weight") {
    targetCalories = calcWeightLossCalories(input);
    goal = "loss";
  } else {
    const bulk = calcBulkCalories(input);
    targetCalories = bulk.calories;
    proteinTargetG = bulk.proteinTargetG;
    goal = "bulk";
  }

  try {
    const mealPlan = await generateMealPlan(targetCalories, {
      goal,
      proteinTargetG,
    });
    return NextResponse.json(mealPlan);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini error:", message);

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { error: "APIキーが設定されていません。.env.local に GEMINI_API_KEY を設定してサーバーを再起動してください。" },
        { status: 503 }
      );
    }
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      const retryMatch = message.match(/retry in ([\d.]+)s/i);
      const retrySec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 30;
      return NextResponse.json(
        { error: `AIのリクエスト上限に達しました。${retrySec}秒後に再試行してください。` },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "AIからの提案の取得に失敗しました。しばらく後にお試しください。" },
      { status: 502 }
    );
  }
}
