"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@stella-ds/react";
import type { MealRequest } from "@/types/meal";

const weightSchema = z
  .object({
    currentWeight: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(20, "20kg以上で入力してください")
      .max(300, "300kg以下で入力してください"),
    targetWeight: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(20, "20kg以上で入力してください")
      .max(300, "300kg以下で入力してください"),
    timeframeWeeks: z.coerce.number().min(1).max(52),
  })
  .refine((d) => d.targetWeight < d.currentWeight, {
    message: "目標体重は現在の体重より軽く設定してください",
    path: ["targetWeight"],
  });

const caloriesSchema = z.object({
  targetCalories: z.coerce
    .number({ invalid_type_error: "数値を入力してください" })
    .min(800, "800kcal以上で入力してください")
    .max(5000, "5000kcal以下で入力してください"),
});

const bulkSchema = z.object({
  currentWeight: z.coerce
    .number({ invalid_type_error: "数値を入力してください" })
    .min(20, "20kg以上で入力してください")
    .max(300, "300kg以下で入力してください"),
  trainingDaysPerWeek: z.coerce.number().min(1).max(7),
});

type WeightForm = z.infer<typeof weightSchema>;
type CaloriesForm = z.infer<typeof caloriesSchema>;
type BulkForm = z.infer<typeof bulkSchema>;

interface InputFormProps {
  onSubmit: (data: MealRequest) => void;
  isLoading: boolean;
}

const TIMEFRAME_OPTIONS = [
  { value: "4", label: "4週間" },
  { value: "8", label: "8週間" },
  { value: "12", label: "12週間（約3ヶ月）" },
  { value: "16", label: "16週間（約4ヶ月）" },
  { value: "24", label: "24週間（約6ヶ月）" },
];

const TRAINING_DAYS_OPTIONS = [
  { value: "1", label: "週1日" },
  { value: "2", label: "週2日" },
  { value: "3", label: "週3日" },
  { value: "4", label: "週4日" },
  { value: "5", label: "週5日" },
  { value: "6", label: "週6日" },
  { value: "7", label: "週7日（毎日）" },
];

const SUBMIT_LABEL = {
  idle: "AIに食事プランを提案してもらう",
  loading: "提案中...",
} as const;

function WeightModeForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: MealRequest) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WeightForm>({
    resolver: zodResolver(weightSchema),
    defaultValues: { timeframeWeeks: 12 },
  });

  const onValid = (data: WeightForm) => {
    onSubmit({
      mode: "weight",
      currentWeight: data.currentWeight,
      targetWeight: data.targetWeight,
      timeframeWeeks: data.timeframeWeeks,
    });
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Stack gap="4">
        <Stack gap="2">
          <Text size="sm" weight="bold">
            現在の体重（kg）
          </Text>
          <Input
            type="number"
            step="0.1"
            placeholder="例: 70"
            {...register("currentWeight")}
            error={errors.currentWeight?.message}
          />
        </Stack>

        <Stack gap="2">
          <Text size="sm" weight="bold">
            目標体重（kg）
          </Text>
          <Input
            type="number"
            step="0.1"
            placeholder="例: 65"
            {...register("targetWeight")}
            error={errors.targetWeight?.message}
          />
        </Stack>

        <Stack gap="2">
          <Text size="sm" weight="bold">
            目標達成期間
          </Text>
          <Select
            defaultValue="12"
            onValueChange={(v) => setValue("timeframeWeeks", parseInt(v, 10))}
          >
            <SelectTrigger />
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>

        <Button type="submit" variant="solid" disabled={isLoading}>
          {isLoading ? SUBMIT_LABEL.loading : SUBMIT_LABEL.idle}
        </Button>
      </Stack>
    </form>
  );
}

function CaloriesModeForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: MealRequest) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaloriesForm>({
    resolver: zodResolver(caloriesSchema),
  });

  const onValid = (data: CaloriesForm) => {
    onSubmit({ mode: "calories", targetCalories: data.targetCalories });
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Stack gap="4">
        <Stack gap="2">
          <Text size="sm" weight="bold">
            1日の目標カロリー（kcal）
          </Text>
          <Input
            type="number"
            placeholder="例: 1800"
            {...register("targetCalories")}
            error={errors.targetCalories?.message}
          />
        </Stack>

        <Button type="submit" variant="solid" disabled={isLoading}>
          {isLoading ? SUBMIT_LABEL.loading : SUBMIT_LABEL.idle}
        </Button>
      </Stack>
    </form>
  );
}

function BulkModeForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: MealRequest) => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BulkForm>({
    resolver: zodResolver(bulkSchema),
    defaultValues: { trainingDaysPerWeek: 3 },
  });

  const onValid = (data: BulkForm) => {
    onSubmit({
      mode: "bulk",
      currentWeight: data.currentWeight,
      trainingDaysPerWeek: data.trainingDaysPerWeek,
    });
  };

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Stack gap="4">
        <Stack gap="2">
          <Text size="sm" weight="bold">
            現在の体重（kg）
          </Text>
          <Input
            type="number"
            step="0.1"
            placeholder="例: 65"
            {...register("currentWeight")}
            error={errors.currentWeight?.message}
          />
        </Stack>

        <Stack gap="2">
          <Text size="sm" weight="bold">
            週のトレーニング日数
          </Text>
          <Select
            defaultValue="3"
            onValueChange={(v) =>
              setValue("trainingDaysPerWeek", parseInt(v, 10))
            }
          >
            <SelectTrigger />
            <SelectContent>
              {TRAINING_DAYS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Stack>

        <Text size="sm" color="secondary">
          体重 × 2g のタンパク質目標と、TDEE + 300 kcal の摂取カロリーを自動計算します。
        </Text>

        <Button type="submit" variant="solid" disabled={isLoading}>
          {isLoading ? SUBMIT_LABEL.loading : SUBMIT_LABEL.idle}
        </Button>
      </Stack>
    </form>
  );
}

export function InputForm({ onSubmit, isLoading }: InputFormProps) {
  return (
    <Tabs defaultValue="weight" variant="solid">
      <TabsList>
        <TabsTrigger value="weight">減量</TabsTrigger>
        <TabsTrigger value="bulk">増量・筋トレ</TabsTrigger>
        <TabsTrigger value="calories">カロリー指定</TabsTrigger>
      </TabsList>

      <TabsContent value="weight">
        <WeightModeForm onSubmit={onSubmit} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="bulk">
        <BulkModeForm onSubmit={onSubmit} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="calories">
        <CaloriesModeForm onSubmit={onSubmit} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
