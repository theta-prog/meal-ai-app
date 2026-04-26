"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedRecipe } from "@/types/storage";
import { SAVED_RECIPES_KEY } from "@/types/storage";
import { detectSavedContentKind, extractSavedContentTitle } from "@/lib/saved-content";

export function useSavedRecipes() {
  const [items, setItems] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_RECIPES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<SavedRecipe> & Pick<SavedRecipe, "id" | "savedAt" | "title" | "content">>;
        setItems(
          parsed.map((item) => ({
            ...item,
            kind: item.kind ?? detectSavedContentKind(item.content),
          })) as SavedRecipe[]
        );
      }
    } catch {
      // ignore corrupted data
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: SavedRecipe[]) => {
    setItems(next);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(next));
  }, []);

  const saveRecipe = useCallback(
    (content: string): SavedRecipe => {
      const kind = detectSavedContentKind(content);
      const recipe: SavedRecipe = {
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
        title: extractSavedContentTitle(content, kind),
        content,
        kind,
      };
      persist([recipe, ...items]);
      return recipe;
    },
    [items, persist]
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      persist(items.filter((item) => item.id !== id));
    },
    [items, persist]
  );

  const recipes = items.filter((item) => item.kind === "recipe");
  const shoppingLists = items.filter((item) => item.kind === "shopping-list");

  return { recipes, shoppingLists, saveRecipe, deleteRecipe, isLoaded };
}
