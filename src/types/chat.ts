export type GoalMode = "cut" | "bulk" | "maintain";
export type GoalSex = "male" | "female";

export interface UserGoal {
  mode: GoalMode;
  sex: GoalSex;
  age: number;
  heightCm: number;
  currentWeight: number;
  targetWeight?: number;
  timeframeWeeks?: number;
  trainingDaysPerWeek?: number;
  targetCalories: number;
  proteinTargetG?: number;
}

export const GOAL_STORAGE_KEY = "meal-ai-user-goal" as const;
