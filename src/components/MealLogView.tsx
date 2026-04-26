"use client";

import { useState } from "react";
import { Badge, Button, Stack, Text } from "@stella-ds/react";
import type { MealLogEntry } from "@/types/storage";
import { LogMealDialog } from "@/components/LogMealDialog";

interface MealLogViewProps {
  entriesByDate: Record<string, MealLogEntry[]>;
  sortedDates: string[];
  onDelete: (id: string) => void;
  onAdd: (input: Omit<MealLogEntry, "id" | "loggedAt">) => void;
}

const MEAL_TYPE_COLOR: Record<MealLogEntry["mealType"], "default" | "primary" | "success"> = {
  朝食: "primary",
  昼食: "success",
  夕食: "default",
  間食: "default",
  その他: "default",
};

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "今日";
  if (dateStr === yesterday) return "昨日";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function calcDayCalories(entries: MealLogEntry[]): number | null {
  const withCal = entries.filter((e) => e.calories != null);
  if (withCal.length === 0) return null;
  return withCal.reduce((sum, e) => sum + (e.calories ?? 0), 0);
}

export function MealLogView({ entriesByDate, sortedDates, onDelete, onAdd }: MealLogViewProps) {
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="meal-log-view">
      <div className="meal-log-add-btn-wrap">
        <Button variant="outline" size="sm" onClick={() => setLogOpen(true)}>
          ＋ 食事を記録する
        </Button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <Text size="md" weight="bold">食事の記録がありません</Text>
          <Text size="sm" color="secondary">
            「食事を記録する」から今日食べたものを追加できます。
            ギャラリーのレシピからも記録できます。
          </Text>
        </div>
      ) : (
        <Stack gap="6" style={{ paddingTop: "var(--stella-spacing-2, 0.5rem)" }}>
          {sortedDates.map((date) => {
            const dayEntries = entriesByDate[date];
            const dayTotal = calcDayCalories(dayEntries);
            return (
              <div key={date} className="meal-log-day">
                <div className="meal-log-day-header">
                  <Text size="sm" weight="bold" className="meal-log-day-label">
                    {formatDisplayDate(date)}
                  </Text>
                  {dayTotal != null && (
                    <span className="meal-log-day-total">{dayTotal.toLocaleString()} kcal</span>
                  )}
                </div>
                <Stack gap="2">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="meal-log-entry">
                      <Badge
                        variant="subtle"
                        color={MEAL_TYPE_COLOR[entry.mealType]}
                        size="sm"
                      >
                        {entry.mealType}
                      </Badge>
                      <Text size="sm" style={{ flex: 1 }}>
                        {entry.description}
                      </Text>
                      {entry.calories != null && (
                        <span className="meal-log-cal">{entry.calories} kcal</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(entry.id)}
                        aria-label="削除"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </Stack>
              </div>
            );
          })}
        </Stack>
      )}

      <LogMealDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        onAdd={onAdd}
      />
    </div>
  );
}
