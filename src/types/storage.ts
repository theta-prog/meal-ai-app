export type SavedContentKind = "recipe" | "shopping-list";

export interface SavedRecipe {
  id: string;
  savedAt: string; // ISO date string
  title: string;
  content: string; // raw markdown from chef message
  kind: SavedContentKind;
}

export interface MealLogEntry {
  id: string;
  loggedAt: string; // ISO date string
  date: string; // YYYY-MM-DD
  mealType: "朝食" | "昼食" | "夕食" | "間食" | "その他";
  description: string;
  calories?: number;
  recipeId?: string; // link to saved recipe
}

export const SAVED_RECIPES_KEY = "meal-ai-saved-recipes" as const;
export const MEAL_LOG_KEY = "meal-ai-meal-log" as const;
