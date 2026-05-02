import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import type { MealGoal, MealPlanResponse } from "@/types/meal";

const mealItemSchema = z.object({
  name: z.string(),
  calories: z.number(),
  description: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

const mealPlanSchema = z.object({
  targetCalories: z.number(),
  totalActualCalories: z.number(),
  summary: z.string(),
  meals: z.object({
    breakfast: mealItemSchema,
    lunch: mealItemSchema,
    dinner: mealItemSchema,
    snack: mealItemSchema,
  }),
});

interface PromptOptions {
  goal: MealGoal;
  proteinTargetG?: number;
}

function buildPrompt(targetCalories: number, opts: PromptOptions): string {
  const { goal, proteinTargetG } = opts;

  const goalBlock =
    goal === "bulk"
      ? `- 目的: 筋肉増量（バルクアップ）
- 1日の目標カロリー: ${targetCalories} kcal（カロリー余剰プラン）
- 1日のタンパク質目標: ${proteinTargetG ?? Math.round(targetCalories * 0.3 / 4)} g（筋合成に必要な量）
- 高タンパク・栄養密度の高い食材を積極的に使ってください（鶏むね肉、卵、大豆、魚、米、オートミールなど）
- 間食はトレーニング後のリカバリーを意識した内容にしてください`
      : `- 目的: 体重管理・ダイエット
- 1日の目標カロリー: ${targetCalories} kcal（カロリー制限プラン）
- 栄養バランス（たんぱく質・脂質・炭水化物）を考慮してください`;

  const summaryHint =
    goal === "bulk"
      ? "筋肉を錬金術のように鍛え上げる、力強くてキラキラした語り口"
      : "魔法のパティシエらしい、少しキラキラした語り口";

  const snackHint =
    goal === "bulk"
      ? "トレーニング後リカバリー向け高タンパクスナック"
      : "ヘルシーな間食";

  return `あなたは「魔法のパティシエ」——甘い魔法と栄養学を融合させた不思議な料理人です。
杖のかわりに泡立て器を持ち、食材に魔法をかけて人々を健康にします。

以下の条件に基づいた1日の食事プランとレシピを提案してください。

【条件】
${goalBlock}
- 日本人の食生活に合った、実際に家庭で作れるメニューを提案してください
- 各食事（朝食・昼食・夕食・間食）のバランスを考えてください

【キャラクターについて】
- summaryは${summaryHint}で書いてください（1〜2文）
- descriptionは各料理の魅力を、魔法使い風のひと言で表現してください（1文）
- ingredientsとstepsは普通の日本語で、実用的に書いてください
- snackは${snackHint}を提案してください

以下のJSON形式のみで回答してください。説明文や前置きは一切不要です：
{
  "targetCalories": ${targetCalories},
  "totalActualCalories": <合計カロリー数値>,
  "summary": "<キャラクターらしい全体プランの紹介>",
  "meals": {
    "breakfast": {
      "name": "<料理名>",
      "calories": <カロリー数値>,
      "description": "<魔法使い風の一言>",
      "ingredients": ["<材料1（分量）>", "<材料2（分量）>"],
      "steps": ["<手順1>", "<手順2>"]
    },
    "lunch": {
      "name": "<料理名>",
      "calories": <カロリー数値>,
      "description": "<魔法使い風の一言>",
      "ingredients": ["<材料1（分量）>"],
      "steps": ["<手順1>"]
    },
    "dinner": {
      "name": "<料理名>",
      "calories": <カロリー数値>,
      "description": "<魔法使い風の一言>",
      "ingredients": ["<材料1（分量）>"],
      "steps": ["<手順1>"]
    },
    "snack": {
      "name": "<料理名>",
      "calories": <カロリー数値>,
      "description": "<魔法使い風の一言>",
      "ingredients": ["<材料1（分量）>"],
      "steps": ["<手順1>"]
    }
  }
}`;
}

function parseMealPlan(text: string): MealPlanResponse {
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);
  return mealPlanSchema.parse(parsed);
}

export async function generateMealPlan(
  targetCalories: number,
  opts: PromptOptions
): Promise<MealPlanResponse> {
  const prompt = buildPrompt(targetCalories, opts);

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt,
    maxOutputTokens: 2048,
  });

  if (!text) {
    throw new Error("AI returned empty response");
  }

  return parseMealPlan(text);
}
