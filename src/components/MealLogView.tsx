"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Badge, Button, Stack, Text } from "@stella-ds/react";
import type { MealLogEntry } from "@/types/storage";
import { LogMealDialog } from "@/components/LogMealDialog";
import styles from "./MealLogView.module.css";

interface MealLogViewProps {
  entriesByDate: Record<string, MealLogEntry[]>;
  sortedDates: string[];
  targetCalories?: number;
  onDelete: (id: string) => void;
  onAdd: (input: Omit<MealLogEntry, "id" | "loggedAt">) => void;
}

type TrendRange = "7d" | "30d" | "all";

type CalorieTrendPoint = {
  date: string;
  calories: number;
};

const TREND_RANGE_OPTIONS: Array<{ value: TrendRange; label: string }> = [
  { value: "7d", label: "7日" },
  { value: "30d", label: "30日" },
  { value: "all", label: "全期間" },
];

const MealLogCaloriesChart = dynamic(
  () => import("@/components/MealLogCaloriesChart").then((mod) => mod.MealLogCaloriesChart),
  {
    ssr: false,
    loading: () => (
      <div className={styles.chartLoading}>
        <Text size="sm" color="secondary">カロリー推移を読み込み中...</Text>
      </div>
    ),
  }
);

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

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRangeStart(range: TrendRange): string | null {
  if (range === "all") return null;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (range === "7d" ? 6 : 29));
  return formatDateKey(start);
}

export function MealLogView({ entriesByDate, sortedDates, targetCalories, onDelete, onAdd }: MealLogViewProps) {
  const [logOpen, setLogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TrendRange>("7d");

  const allCalorieTrend = sortedDates
    .map((date) => {
      const calories = calcDayCalories(entriesByDate[date] ?? []);
      if (calories == null) return null;

      return {
        date,
        calories,
      } satisfies CalorieTrendPoint;
    })
    .filter((point): point is CalorieTrendPoint => point !== null)
    .reverse();

  const rangeStart = getRangeStart(selectedRange);
  const visibleDates = rangeStart == null
    ? sortedDates
    : sortedDates.filter((date) => date >= rangeStart);
  const visibleCalorieTrend = visibleDates
    .map((date) => {
      const calories = calcDayCalories(entriesByDate[date] ?? []);
      if (calories == null) return null;

      return {
        date,
        calories,
      } satisfies CalorieTrendPoint;
    })
    .filter((point): point is CalorieTrendPoint => point !== null)
    .reverse();
  const selectedRangeLabel = TREND_RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label ?? "全期間";

  return (
    <div className={styles.view}>
      <div className={styles.addBtnWrap}>
        <Button variant="outline" size="sm" onClick={() => setLogOpen(true)}>
          ＋ 食事を記録する
        </Button>
      </div>

      {sortedDates.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <Text size="md" weight="bold">食事の記録がありません</Text>
          <Text size="sm" color="secondary">
            「食事を記録する」から今日食べたものを追加できます。
            ギャラリーのレシピからも記録できます。
          </Text>
        </div>
      ) : (
        <Stack gap="6" style={{ paddingTop: "var(--stella-spacing-2, 0.5rem)" }}>
          <div className={styles.chartSection}>
            <div className={styles.chartToolbar}>
              <Text size="xs" color="secondary" className={styles.chartPeriodLabel}>
                グラフ表示期間
              </Text>
              <div className={styles.rangePicker} role="group" aria-label="カロリー推移の表示期間">
                {TREND_RANGE_OPTIONS.map((option) => {
                  const isActive = option.value === selectedRange;

                  return (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      className={styles.rangeButton}
                      data-active={isActive ? "true" : "false"}
                      aria-pressed={isActive}
                      onClick={() => setSelectedRange(option.value)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {allCalorieTrend.length > 0 ? (
              <div className={styles.chartSection}>
                {visibleCalorieTrend.length > 0 ? (
                  <MealLogCaloriesChart
                    data={visibleCalorieTrend}
                    targetCalories={targetCalories}
                  />
                ) : (
                  <div className={styles.chartEmpty}>
                    <Text size="sm" weight="bold">この期間のカロリー推移はまだない</Text>
                    <Text size="sm" color="secondary">
                      {visibleDates.length === 0
                        ? `${selectedRangeLabel}の食事記録がまだない。`
                        : `${selectedRangeLabel}の記録にはカロリー入力がまだない。`}
                    </Text>
                  </div>
                )}

                {visibleCalorieTrend.length > 0 && visibleCalorieTrend.length < visibleDates.length && (
                  <Text size="xs" color="secondary" className={styles.chartHint}>
                    カロリー未入力の記録日は、推移グラフから除外してる。
                  </Text>
                )}
              </div>
            ) : (
              <div className={styles.chartEmpty}>
                <Text size="sm" weight="bold">カロリー推移はまだ表示できない</Text>
                <Text size="sm" color="secondary">
                  カロリー付きの食事記録を1件以上追加すると、ここに日別グラフが出る。
                </Text>
              </div>
            )}
          </div>

          {sortedDates.map((date) => {
            const dayEntries = entriesByDate[date] ?? [];
            const dayTotal = calcDayCalories(dayEntries);
            return (
              <div key={date} className={styles.day}>
                <div className={styles.dayHeader}>
                  <Text size="sm" weight="bold" className={styles.dayLabel}>
                    {formatDisplayDate(date)}
                  </Text>
                  {dayTotal != null && (
                    <span className={styles.dayTotal}>{dayTotal.toLocaleString()} kcal</span>
                  )}
                </div>
                <Stack gap="2">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className={styles.entry}>
                      <Badge
                        variant="subtle"
                        color={MEAL_TYPE_COLOR[entry.mealType]}
                        size="sm"
                      >
                        {entry.mealType}
                      </Badge>
                      <Text size="sm" className={styles.entryText} style={{ flex: 1 }}>
                        {entry.description}
                      </Text>
                      {entry.calories != null && (
                        <span className={styles.entryCal}>{entry.calories} kcal</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.deleteBtn}
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
