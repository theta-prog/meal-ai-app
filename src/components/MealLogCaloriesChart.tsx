"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./MealLogCaloriesChart.module.css";

interface MealLogCaloriesChartProps {
  data: Array<{
    date: string;
    calories: number;
  }>;
  targetCalories?: number;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatLongDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function MealLogCaloriesChart({ data, targetCalories }: MealLogCaloriesChartProps) {
  const totalCalories = data.reduce((sum, point) => sum + point.calories, 0);
  const averageCalories = Math.round(totalCalories / data.length);
  const latestCalories = data[data.length - 1]?.calories ?? 0;
  const highestCalories = Math.max(...data.map((point) => point.calories));
  const maxValue = Math.max(highestCalories, targetCalories ?? 0);
  const yAxisMax = Math.max(400, Math.ceil((maxValue * 1.12) / 100) * 100);
  const latestDelta = targetCalories != null ? latestCalories - targetCalories : null;

  return (
    <section className={styles.chartShell} aria-label="カロリー推移グラフ">
      <div className={styles.chartCopy}>
        <div>
          <p className={styles.chartKicker}>Meal Log</p>
          <h3 className={styles.chartTitle}>日別カロリー推移</h3>
          <p className={styles.chartNote}>
            カロリーを入力した日の合計だけを拾って、流れが見えるようにしてる。
          </p>
        </div>

        {targetCalories != null && (
          <div className={styles.chartTarget}>
            <span className={styles.chartTargetDot} aria-hidden="true" />
            目標 {targetCalories.toLocaleString()} kcal
          </div>
        )}
      </div>

      <div className={styles.chartStats}>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>記録日数</span>
          <strong className={styles.chartStatValue}>{data.length}日</strong>
        </div>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>平均</span>
          <strong className={styles.chartStatValue}>{averageCalories.toLocaleString()} kcal</strong>
        </div>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>
            {latestDelta != null ? "最新差分" : "最高"}
          </span>
          <strong className={styles.chartStatValue}>
            {latestDelta != null
              ? `${latestDelta > 0 ? "+" : ""}${latestDelta.toLocaleString()} kcal`
              : `${highestCalories.toLocaleString()} kcal`}
          </strong>
        </div>
      </div>

      <div className={styles.chartCanvas}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="meal-log-calories-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--stella-color-cosmos-500)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--stella-color-cosmos-500)" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--stella-color-void-muted)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tick={{ fill: "var(--stella-color-starlight-secondary)", fontSize: 12 }}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, yAxisMax]}
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: "var(--stella-color-starlight-secondary)", fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip
              cursor={{ stroke: "var(--stella-color-cosmos-300)", strokeDasharray: "5 5" }}
              contentStyle={{
                border: "1px solid var(--stella-color-void-muted)",
                borderRadius: "14px",
                background: "var(--stella-color-void-surface)",
                boxShadow: "var(--stella-shadow-lg)",
              }}
              labelStyle={{ color: "var(--stella-color-starlight-primary)", fontWeight: 700 }}
              formatter={(value) => [`${Number(value).toLocaleString()} kcal`, "合計"]}
              labelFormatter={(label) => formatLongDate(String(label))}
            />

            {targetCalories != null && (
              <ReferenceLine
                y={targetCalories}
                stroke="var(--stella-color-nebula-400)"
                strokeDasharray="7 5"
                ifOverflow="extendDomain"
              />
            )}

            <Area
              type="monotone"
              dataKey="calories"
              stroke="var(--stella-color-cosmos-500)"
              strokeWidth={3}
              fill="url(#meal-log-calories-fill)"
              activeDot={{ r: 6, fill: "var(--stella-color-cosmos-500)", stroke: "var(--stella-color-void-surface)", strokeWidth: 2 }}
              dot={{ r: 3, fill: "var(--stella-color-cosmos-500)", stroke: "var(--stella-color-void-surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}