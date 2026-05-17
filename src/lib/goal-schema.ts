import { z } from "zod";

export const userGoalSchema = z.object({
  mode: z.enum(["cut", "bulk", "maintain"]),
  sex: z.enum(["male", "female"]),
  age: z.number().finite().int().min(10).max(120),
  heightCm: z.number().finite().min(100).max(250),
  currentWeight: z.number().finite().min(20).max(300),
  targetCalories: z.number().finite().int().min(800),
  proteinTargetG: z.number().finite().int().optional(),
  targetWeight: z.number().finite().min(20).max(300).optional(),
  trainingDaysPerWeek: z.number().finite().int().min(1).max(7).optional(),
  timeframeWeeks: z.number().finite().int().min(1).max(52).optional(),
});

export function getUserGoalErrorMessage(error: z.ZodError): string {
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return "目標プロフィールの内容を確認して、もう一度保存してください。";
  }

  const field = firstIssue.path[0];

  if (field === "targetCalories") {
    return "計算された目標カロリーが不正です。身長・体重・年齢の入力内容を見直してください。";
  }

  if (field === "age") {
    return "年齢の入力内容を確認してください。";
  }

  if (field === "heightCm") {
    return "身長の入力内容を確認してください。";
  }

  if (field === "currentWeight") {
    return "現在の体重の入力内容を確認してください。";
  }

  if (field === "targetWeight") {
    return "目標体重の入力内容を確認してください。";
  }

  if (field === "trainingDaysPerWeek") {
    return "トレーニング日数の入力内容を確認してください。";
  }

  if (field === "timeframeWeeks") {
    return "目標達成期間の入力内容を確認してください。";
  }

  return "目標プロフィールの内容を確認して、もう一度保存してください。";
}