"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  RadioGroup,
  RadioItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Text,
} from "@stella-ds/react";
import type { GoalSex, UserGoal } from "@/types/chat";
import {
  calcWeightLossCalories,
  calcBulkCalories,
  calcMaintainCalories,
} from "@/lib/calorie-calc";

const SEX_OPTIONS: Array<{ value: GoalSex; label: string }> = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
];

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

const schema = z
  .object({
    mode: z.enum(["cut", "bulk", "maintain"]),
    sex: z.enum(["male", "female"], { message: "性別を選択してください" }),
    age: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(13, "13歳以上で入力してください")
      .max(100, "100歳以下で入力してください"),
    heightCm: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(120, "120cm以上で入力してください")
      .max(220, "220cm以下で入力してください"),
    currentWeight: z.coerce
      .number({ invalid_type_error: "数値を入力してください" })
      .min(20, "20kg以上で入力してください")
      .max(300, "300kg以下で入力してください"),
    targetWeight: z.number().min(20).max(300).optional(),
    timeframeWeeks: z.coerce.number().min(1).max(52).optional(),
    trainingDaysPerWeek: z.coerce.number().min(1).max(7).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "cut") {
      if (data.targetWeight == null) {
        ctx.addIssue({ code: "custom", path: ["targetWeight"], message: "目標体重を入力してください" });
      } else if (data.targetWeight >= data.currentWeight) {
        ctx.addIssue({ code: "custom", path: ["targetWeight"], message: "目標体重は現在の体重より軽く設定してください" });
      }
    }
    if (data.mode === "bulk" && data.trainingDaysPerWeek == null) {
      ctx.addIssue({ code: "custom", path: ["trainingDaysPerWeek"], message: "トレーニング日数を選択してください" });
    }
  });

type FormValues = z.infer<typeof schema>;

function calcPreviewCalories(values: Partial<FormValues>): number | null {
  if (
    !values.mode ||
    !values.sex ||
    !values.age ||
    !values.heightCm ||
    !values.currentWeight
  ) {
    return null;
  }

  const profile = {
    sex: values.sex,
    age: values.age,
    heightCm: values.heightCm,
    currentWeight: values.currentWeight,
  };

  if (values.mode === "cut" && values.targetWeight && values.timeframeWeeks) {
    return calcWeightLossCalories({
      ...profile,
      targetWeight: values.targetWeight,
      timeframeWeeks: values.timeframeWeeks,
    });
  }
  if (values.mode === "bulk" && values.trainingDaysPerWeek) {
    return calcBulkCalories({
      ...profile,
      trainingDaysPerWeek: values.trainingDaysPerWeek,
    }).calories;
  }
  if (values.mode === "maintain") {
    return calcMaintainCalories(profile);
  }
  return null;
}

interface GoalSetupProps {
  initialGoal?: UserGoal | null;
  onSave: (input: Omit<UserGoal, "targetCalories" | "proteinTargetG">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalSetup({ initialGoal, onSave, open, onOpenChange }: GoalSetupProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, submitCount },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    shouldFocusError: true,
    defaultValues: {
      mode: initialGoal?.mode ?? "cut",
      sex: initialGoal?.sex,
      age: initialGoal?.age,
      heightCm: initialGoal?.heightCm,
      currentWeight: initialGoal?.currentWeight,
      targetWeight: initialGoal?.targetWeight,
      timeframeWeeks: initialGoal?.timeframeWeeks ?? 12,
      trainingDaysPerWeek: initialGoal?.trainingDaysPerWeek ?? 3,
    },
  });

  const mode = watch("mode");
  const allValues = watch();
  const previewCalories = calcPreviewCalories(allValues);
  const firstErrorMessage = [
    errors.sex?.message,
    errors.age?.message,
    errors.heightCm?.message,
    errors.currentWeight?.message,
    mode === "cut" ? errors.targetWeight?.message ?? errors.timeframeWeeks?.message : undefined,
    mode === "bulk" ? errors.trainingDaysPerWeek?.message : undefined,
  ].find((message): message is string => Boolean(message));

  useEffect(() => {
    if (initialGoal) {
      reset({
        mode: initialGoal.mode,
        sex: initialGoal.sex,
        age: initialGoal.age,
        heightCm: initialGoal.heightCm,
        currentWeight: initialGoal.currentWeight,
        targetWeight: initialGoal.targetWeight,
        timeframeWeeks: initialGoal.timeframeWeeks ?? 12,
        trainingDaysPerWeek: initialGoal.trainingDaysPerWeek ?? 3,
      });
    }
  }, [initialGoal, reset]);

  const onValid = (data: FormValues) => {
    onSave({
      mode: data.mode,
      sex: data.sex,
      age: data.age,
      heightCm: data.heightCm,
      currentWeight: data.currentWeight,
      targetWeight: data.targetWeight,
      timeframeWeeks: data.timeframeWeeks,
      trainingDaysPerWeek: data.trainingDaysPerWeek,
    });
    onOpenChange(false);
  };

  const canClose = initialGoal != null;

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent showClose={canClose} className="goal-dialog">
        <DialogHeader className="goal-dialog-header">
          <DialogTitle className="goal-dialog-title">目標プロフィールの設定</DialogTitle>
          <DialogDescription className="goal-dialog-description">
            あなたの目標を設定するとパティシエが最適な食事を提案できます
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onValid)} className="goal-dialog-form">
          <Stack gap="6">
            {/* モード選択 */}
            <div className="goal-mode-panel">
              <Text size="sm" weight="bold" className="goal-field-label">目標</Text>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="goal-mode-group"
                    value={field.value}
                    onValueChange={field.onChange}
                    orientation="horizontal"
                  >
                    <RadioItem className="goal-mode-item" value="cut" label="減量" />
                    <RadioItem className="goal-mode-item" value="bulk" label="増量・筋トレ" />
                    <RadioItem className="goal-mode-item" value="maintain" label="維持" />
                  </RadioGroup>
                )}
              />
            </div>

            <div className="goal-field-grid goal-field-grid--two">
              <div className="goal-field-group">
                <Text size="sm" weight="bold" className="goal-field-label">性別</Text>
                <Controller
                  name="sex"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger
                        className="goal-field"
                        placeholder="選択してください"
                        error={errors.sex?.message}
                      />
                      <SelectContent className="goal-select-content">
                        {SEX_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="goal-select-item"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="goal-field-group">
                <Text size="sm" weight="bold" className="goal-field-label">年齢</Text>
                <Input
                  type="number"
                  placeholder="例: 29"
                  className="goal-field"
                  {...register("age")}
                  error={errors.age?.message}
                />
              </div>
            </div>

            <div className="goal-field-grid goal-field-grid--two">
              <div className="goal-field-group">
                <Text size="sm" weight="bold" className="goal-field-label">身長（cm）</Text>
                <Input
                  type="number"
                  placeholder="例: 170"
                  className="goal-field"
                  {...register("heightCm")}
                  error={errors.heightCm?.message}
                />
              </div>

              <div className="goal-field-group">
                <Text size="sm" weight="bold" className="goal-field-label">現在の体重（kg）</Text>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="例: 70"
                  className="goal-field"
                  {...register("currentWeight")}
                  error={errors.currentWeight?.message}
                />
              </div>
            </div>

            {/* 減量モード専用 */}
            {mode === "cut" && (
              <>
                <div className="goal-field-group">
                  <Text size="sm" weight="bold" className="goal-field-label">目標体重（kg）</Text>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="例: 65"
                    className="goal-field"
                    {...register("targetWeight", {
                      setValueAs: (value) => (value === "" ? undefined : Number(value)),
                    })}
                    error={errors.targetWeight?.message}
                  />
                </div>
                <div className="goal-field-group">
                  <Text size="sm" weight="bold" className="goal-field-label">目標達成期間</Text>
                  <Controller
                    name="timeframeWeeks"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value != null ? String(field.value) : undefined}
                        onValueChange={(v) => field.onChange(parseInt(v, 10))}
                      >
                        <SelectTrigger
                          className="goal-field"
                          error={errors.timeframeWeeks?.message}
                        />
                        <SelectContent className="goal-select-content">
                          {TIMEFRAME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="goal-select-item">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </>
            )}

            {/* 増量モード専用 */}
            {mode === "bulk" && (
              <div className="goal-field-group">
                <Text size="sm" weight="bold" className="goal-field-label">週のトレーニング日数</Text>
                <Controller
                  name="trainingDaysPerWeek"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value != null ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(parseInt(v, 10))}
                    >
                      <SelectTrigger
                        className="goal-field"
                        error={errors.trainingDaysPerWeek?.message}
                      />
                      <SelectContent className="goal-select-content">
                        {TRAINING_DAYS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="goal-select-item">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* カロリープレビュー */}
            {previewCalories != null && (
              <Card className="goal-preview-card" style={{ borderLeft: "3px solid var(--stella-color-nebula-500, #a855f7)" }}>
                <CardContent>
                  <Stack gap="1">
                    <Text size="sm" color="secondary" className="goal-preview-label">身長・年齢・性別を反映した推定目標カロリー</Text>
                    <Text size="lg" weight="bold" className="goal-preview-value">
                      {previewCalories.toLocaleString()} kcal / 日
                    </Text>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {submitCount > 0 && firstErrorMessage && (
              <div className="goal-form-error" role="alert">
                <Text size="sm" weight="medium" className="goal-form-error-text">
                  保存する前に入力内容を確認してね: {firstErrorMessage}
                </Text>
              </div>
            )}

            <DialogFooter className="goal-dialog-footer">
              {canClose && (
                <Button
                  type="button"
                  variant="ghost"
                  className="goal-dialog-cancel"
                  onClick={() => onOpenChange(false)}
                >
                  キャンセル
                </Button>
              )}
              <Button type="submit" variant="solid" className="goal-dialog-submit">
                設定を保存
              </Button>
            </DialogFooter>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
