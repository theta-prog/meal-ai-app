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
    <section className="meal-log-chart-shell" aria-label="カロリー推移グラフ">
      <div className="meal-log-chart-copy">
        <div>
          <p className="meal-log-chart-kicker">Meal Log</p>
          <h3 className="meal-log-chart-title">日別カロリー推移</h3>
          <p className="meal-log-chart-note">
            カロリーを入力した日の合計だけを拾って、流れが見えるようにしてる。
          </p>
        </div>

        {targetCalories != null && (
          <div className="meal-log-chart-target">
            <span className="meal-log-chart-target-dot" aria-hidden="true" />
            目標 {targetCalories.toLocaleString()} kcal
          </div>
        )}
      </div>

      <div className="meal-log-chart-stats">
        <div className="meal-log-chart-stat">
          <span className="meal-log-chart-stat-label">記録日数</span>
          <strong className="meal-log-chart-stat-value">{data.length}日</strong>
        </div>
        <div className="meal-log-chart-stat">
          <span className="meal-log-chart-stat-label">平均</span>
          <strong className="meal-log-chart-stat-value">{averageCalories.toLocaleString()} kcal</strong>
        </div>
        <div className="meal-log-chart-stat">
          <span className="meal-log-chart-stat-label">
            {latestDelta != null ? "最新差分" : "最高"}
          </span>
          <strong className="meal-log-chart-stat-value">
            {latestDelta != null
              ? `${latestDelta > 0 ? "+" : ""}${latestDelta.toLocaleString()} kcal`
              : `${highestCalories.toLocaleString()} kcal`}
          </strong>
        </div>
      </div>

      <div className="meal-log-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="meal-log-calories-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.06} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(148, 163, 184, 0.28)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <YAxis
              allowDecimals={false}
              domain={[0, yAxisMax]}
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />

            <Tooltip
              cursor={{ stroke: "rgba(15, 118, 110, 0.28)", strokeDasharray: "5 5" }}
              contentStyle={{
                border: "1px solid rgba(203, 213, 225, 0.9)",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.96)",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 700 }}
              formatter={(value) => [`${Number(value).toLocaleString()} kcal`, "合計"]}
              labelFormatter={(label) => formatLongDate(String(label))}
            />

            {targetCalories != null && (
              <ReferenceLine
                y={targetCalories}
                stroke="#f97316"
                strokeDasharray="7 5"
                ifOverflow="extendDomain"
              />
            )}

            <Area
              type="monotone"
              dataKey="calories"
              stroke="#0f766e"
              strokeWidth={3}
              fill="url(#meal-log-calories-fill)"
              activeDot={{ r: 6, fill: "#0f766e", stroke: "#ffffff", strokeWidth: 2 }}
              dot={{ r: 3, fill: "#0f766e", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}