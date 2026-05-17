"use client";

import { useState, useEffect, useCallback } from "react";
import type { SavedRecipe } from "@/types/storage";

function toClientItem(raw: Record<string, unknown>): SavedRecipe {
  return {
    id: raw.id as string,
    savedAt: raw.savedAt instanceof Date
      ? (raw.savedAt as Date).toISOString()
      : String(raw.savedAt),
    title: raw.title as string,
    content: raw.content as string,
    kind: raw.kind as SavedRecipe["kind"],
  };
}

export function useSavedRecipes() {
  const [items, setItems] = useState<SavedRecipe[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setItems((data as Record<string, unknown>[]).map(toClientItem));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const saveRecipe = useCallback(async (content: string) => {
    const res = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, savedAt: new Date().toISOString() }),
    });
    if (!res.ok) return;
    const created = toClientItem((await res.json()) as Record<string, unknown>);
    setItems((prev) => [created, ...prev]);
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    await fetch(`/api/saved/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const recipes = items.filter((item) => item.kind === "recipe");
  const shoppingLists = items.filter((item) => item.kind === "shopping-list");

  return { recipes, shoppingLists, saveRecipe, deleteRecipe, isLoaded };
}
