"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserGoal } from "@/types/chat";
import {
  calcWeightLossCalories,
  calcBulkCalories,
  calcMaintainCalories,
} from "@/lib/calorie-calc";
import { getUserGoalErrorMessage, userGoalSchema } from "@/lib/goal-schema";

type GoalInput = Omit<UserGoal, "targetCalories" | "proteinTargetG">;

function isStoredGoal(value: unknown): value is UserGoal {
  return userGoalSchema.safeParse(value).success;
}

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return fallback;
}

export function useUserGoal() {
  const [goal, setGoalState] = useState<UserGoal | null>(null);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadGoal() {
      setGoalError(null);

      try {
        const response = await fetch("/api/goals");
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(
              data,
              "目標プロフィールの読み込みに失敗しました。設定を確認して再読み込みしてください。"
            )
          );
        }

        if (isStoredGoal(data)) {
          setGoalState(data);
          return;
        }

        setGoalState(null);
      } catch (error) {
        setGoalState(null);
        setGoalError(
          error instanceof Error
            ? error.message
            : "目標プロフィールの読み込みに失敗しました。設定を確認して再読み込みしてください。"
        );
      } finally {
        setIsLoaded(true);
      }
    }

    void loadGoal();
  }, []);

  const saveGoal = useCallback(async (input: GoalInput) => {
    setGoalError(null);

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
    } else if (input.mode === "bulk" && input.trainingDaysPerWeek != null) {
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
    const parsedGoal = userGoalSchema.safeParse(full);

    if (!parsedGoal.success) {
      const message = getUserGoalErrorMessage(parsedGoal.error);
      setGoalError(message);
      throw new Error(message);
    }

    const response = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedGoal.data),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = getApiErrorMessage(
        data,
        "目標プロフィールの保存に失敗しました。設定を確認してもう一度試してください。"
      );
      setGoalError(message);
      throw new Error(message);
    }

    setGoalState(parsedGoal.data);
  }, []);

  const clearGoal = useCallback(async () => {
    setGoalError(null);

    const response = await fetch("/api/goals", { method: "DELETE" });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = getApiErrorMessage(
        data,
        "目標プロフィールの削除に失敗しました。もう一度試してください。"
      );
      setGoalError(message);
      throw new Error(message);
    }

    setGoalState(null);
  }, []);

  return { goal, saveGoal, clearGoal, isLoaded, goalError };
}
