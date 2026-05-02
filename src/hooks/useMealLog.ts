"use client";

import { useState, useEffect, useCallback } from "react";
import type { MealLogEntry } from "@/types/storage";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function toClientEntry(raw: Record<string, unknown>): MealLogEntry {
  return {
    id: raw.id as string,
    loggedAt: raw.loggedAt instanceof Date
      ? (raw.loggedAt as Date).toISOString()
      : String(raw.loggedAt),
    date: raw.date as string,
    mealType: raw.mealType as MealLogEntry["mealType"],
    description: raw.description as string,
    calories: raw.calories != null ? Number(raw.calories) : undefined,
    recipeId: raw.recipeId as string | undefined,
  };
}

export function useMealLog() {
  const [entries, setEntries] = useState<MealLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/meal-log")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setEntries((data as Record<string, unknown>[]).map(toClientEntry));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const addEntry = useCallback(
    async (input: Omit<MealLogEntry, "id" | "loggedAt">) => {
      const loggedAt = new Date().toISOString();
      const res = await fetch("/api/meal-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, loggedAt }),
      });
      if (!res.ok) return;
      const created = toClientEntry((await res.json()) as Record<string, unknown>);
      setEntries((prev) => [created, ...prev]);
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    await fetch(`/api/meal-log/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const entriesByDate = entries.reduce<Record<string, MealLogEntry[]>>(
    (acc, entry) => {
      (acc[entry.date] ??= []).push(entry);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(entriesByDate).sort((a, b) =>
    b.localeCompare(a)
  );

  return {
    entries,
    entriesByDate,
    sortedDates,
    addEntry,
    deleteEntry,
    isLoaded,
    todayStr,
  };
}
