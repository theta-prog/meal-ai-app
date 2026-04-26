export type InputMode = "weight" | "calories" | "bulk";

export interface WeightInput {
  mode: "weight";
  currentWeight: number;
  targetWeight: number;
  timeframeWeeks: number;
}

export interface CaloriesInput {
  mode: "calories";
  targetCalories: number;
}

export interface BulkInput {
  mode: "bulk";
  currentWeight: number;
  trainingDaysPerWeek: number;
}

export type MealRequest = WeightInput | CaloriesInput | BulkInput;

export type MealGoal = "loss" | "bulk";

export interface MealItem {
  name: string;
  calories: number;
  description: string;
  ingredients: string[];
  steps: string[];
}

export interface MealPlanResponse {
  targetCalories: number;
  totalActualCalories: number;
  summary: string;
  meals: {
    breakfast: MealItem;
    lunch: MealItem;
    dinner: MealItem;
    snack: MealItem;
  };
}
