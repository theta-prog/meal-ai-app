"use client";

import { useState, useEffect, useCallback } from "react";
import type { GoalMode, GoalSex, UserGoal } from "@/types/chat";
import { GOAL_STORAGE_KEY } from "@/types/chat";
import {
  calcWeightLossCalories,
  calcBulkCalories,
  calcMaintainCalories,
} from "@/lib/calorie-calc";

type GoalInput = Omit<UserGoal, "targetCalories" | "proteinTargetG">;

function isGoalMode(value: unknown): value is GoalMode {
  return value === "cut" || value === "bulk" || value === "maintain";
}

function isGoalSex(value: unknown): value is GoalSex {
  return value === "male" || value === "female";
}

function isStoredGoal(value: unknown): value is UserGoal {
  if (!value || typeof value !== "object") return false;

  const goal = value as Record<string, unknown>;
  return (
    isGoalMode(goal.mode) &&
    isGoalSex(goal.sex) &&
    typeof goal.age === "number" &&
    typeof goal.heightCm === "number" &&
    typeof goal.currentWeight === "number" &&
    typeof goal.targetCalories === "number"
  );
}

export function useUserGoal() {
  const [goal, setGoalState] = useState<UserGoal | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isStoredGoal(parsed)) {
          setGoalState(parsed);
        }
      }
    } catch {
      // corrupted storage — ignore
    }
    setIsLoaded(true);
  }, []);

  const saveGoal = useCallback((input: GoalInput) => {
    let targetCalories: number;
    let proteinTargetG: number | undefined;

    if (
      input.mode === "cut" &&
      input.targetWeight != null &&
      input.timeframeWeeks != null
    ) {
      targetCalories = calcWeightLossCalories({
        sex: input.sex,
        age: input.age,
        heightCm: input.heightCm,
        currentWeight: input.currentWeight,
        targetWeight: input.targetWeight,
        timeframeWeeks: input.timeframeWeeks,
      });
    } else if (
      input.mode === "bulk" &&
      input.trainingDaysPerWeek != null
    ) {
      const bulk = calcBulkCalories({
        sex: input.sex,
        age: input.age,
        heightCm: input.heightCm,
        currentWeight: input.currentWeight,
        trainingDaysPerWeek: input.trainingDaysPerWeek,
      });
      targetCalories = bulk.calories;
      proteinTargetG = bulk.proteinTargetG;
    } else {
      targetCalories = calcMaintainCalories({
        sex: input.sex,
        age: input.age,
        heightCm: input.heightCm,
        currentWeight: input.currentWeight,
      });
    }

    const full: UserGoal = { ...input, targetCalories, proteinTargetG };
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(full));
    setGoalState(full);
  }, []);

  const clearGoal = useCallback(() => {
    localStorage.removeItem(GOAL_STORAGE_KEY);
    setGoalState(null);
  }, []);

  return { goal, saveGoal, clearGoal, isLoaded };
}
