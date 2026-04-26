import type { GoalSex } from "@/types/chat";

interface BodyProfile {
  sex: GoalSex;
  age: number;
  heightCm: number;
  currentWeight: number;
  trainingDaysPerWeek?: number;
}

function getActivityMultiplier(trainingDaysPerWeek?: number): number {
  if (trainingDaysPerWeek == null) return 1.375;
  if (trainingDaysPerWeek <= 1) return 1.2;
  if (trainingDaysPerWeek <= 3) return 1.375;
  if (trainingDaysPerWeek <= 5) return 1.55;
  return 1.725;
}

function calcBmr(profile: BodyProfile): number {
  const base =
    10 * profile.currentWeight +
    6.25 * profile.heightCm -
    5 * profile.age;

  return profile.sex === "male" ? base + 5 : base - 161;
}

export function calcWeightLossCalories(params: BodyProfile & {
  targetWeight: number;
  timeframeWeeks: number;
}): number {
  const maintenance = calcMaintainCalories(params);
  const deficit =
    ((params.currentWeight - params.targetWeight) * 7700) /
    (params.timeframeWeeks * 7);
  const minimumCalories = params.sex === "male" ? 1500 : 1200;

  return Math.max(
    minimumCalories,
    Math.min(maintenance, Math.round(maintenance - deficit))
  );
}

export function calcBulkCalories(params: BodyProfile & {
  trainingDaysPerWeek: number;
}): { calories: number; proteinTargetG: number } {
  const maintenance = calcMaintainCalories(params);
  const calories = Math.min(4500, maintenance + 250);
  const proteinTargetG = Math.round(params.currentWeight * 2);
  return { calories, proteinTargetG };
}

export function calcMaintainCalories(profile: BodyProfile): number {
  return Math.round(calcBmr(profile) * getActivityMultiplier(profile.trainingDaysPerWeek));
}
