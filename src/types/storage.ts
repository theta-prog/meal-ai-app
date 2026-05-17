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
