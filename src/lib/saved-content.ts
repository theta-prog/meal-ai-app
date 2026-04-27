import type { SavedContentKind } from "@/types/storage";

const SHOPPING_LIST_KEYWORDS = [
  "買い物リスト",
  "買い出しリスト",
  "shopping list",
  "shopping-list",
] as const;

export function detectSavedContentKind(markdown: string): SavedContentKind | "none" {
  const normalized = markdown.trim().toLowerCase();

  if (SHOPPING_LIST_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "shopping-list";
  }
  const hasMarkdownTable = /^\|.+\|\s*$/m.test(markdown);
  if (hasMarkdownTable && /(数量|個数|分量|食材|品目)/.test(markdown)) {
    return "shopping-list";
  }

  const hasRecipeHeading = /^##\s+.+/m.test(markdown);
  const hasNumberedSteps = /^\d+\.\s+.+/m.test(markdown);
  const hasIngredientList = /^-\s+.+[:：].+/m.test(markdown);
  const hasCalorieInfo = /kcal/i.test(markdown);
  if (hasRecipeHeading && (hasNumberedSteps || hasIngredientList || hasCalorieInfo)) {
    return "recipe";
  }

  return "none";
}

export function extractSavedContentTitle(markdown: string, kind: SavedContentKind): string {
  const h2 = markdown.match(/^##\s+(.+)$/m);
  if (h2) return h2[1].trim();

  const h1 = markdown.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();

  if (kind === "shopping-list") {
    const shoppingLine = markdown
      .split("\n")
      .find((line) => SHOPPING_LIST_KEYWORDS.some((keyword) => line.toLowerCase().includes(keyword)));
    if (shoppingLine) return shoppingLine.trim().slice(0, 40);
  }

  const firstLine = markdown.split("\n").find((line) => line.trim().length > 0);
  return firstLine?.trim().slice(0, 40) ?? (kind === "shopping-list" ? "保存した買い物リスト" : "保存したレシピ");
}