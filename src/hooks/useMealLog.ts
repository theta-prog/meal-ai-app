"use client";

import { useState, useEffect, useCallback } from "react";
import type { MealLogEntry } from "@/types/storage";
import { MEAL_LOG_KEY } from "@/types/storage";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useMealLog() {
  const [entries, setEntries] = useState<MealLogEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEAL_LOG_KEY);
      if (raw) setEntries(JSON.parse(raw) as MealLogEntry[]);
    } catch {
      // ignore corrupted data
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: MealLogEntry[]) => {
    setEntries(next);
    localStorage.setItem(MEAL_LOG_KEY, JSON.stringify(next));
  }, []);

  const addEntry = useCallback(
    (input: Omit<MealLogEntry, "id" | "loggedAt">) => {
      const entry: MealLogEntry = {
        ...input,
        id: crypto.randomUUID(),
        loggedAt: new Date().toISOString(),
      };
      persist([entry, ...entries]);
      return entry;
    },
    [entries, persist]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist]
  );

  // Group entries by date descending
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
