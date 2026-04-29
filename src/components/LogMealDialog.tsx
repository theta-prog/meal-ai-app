"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Text,
} from "@stella-ds/react";
import type { MealLogEntry } from "@/types/storage";
import styles from "./LogMealDialog.module.css";

const MEAL_TYPES = ["朝食", "昼食", "夕食", "間食", "その他"] as const;

const schema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  mealType: z.enum(["朝食", "昼食", "夕食", "間食", "その他"]),
  description: z.string().min(1, "内容を入力してください"),
  calories: z.coerce.number().min(1).max(9999).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface LogMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (input: Omit<MealLogEntry, "id" | "loggedAt">) => void;
  defaultDescription?: string;
  defaultDate?: string;
  recipeId?: string;
}

export function LogMealDialog({
  open,
  onOpenChange,
  onAdd,
  defaultDescription = "",
  defaultDate,
  recipeId,
}: LogMealDialogProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ?? todayStr,
      mealType: "夕食",
      description: defaultDescription,
      calories: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      date: defaultDate ?? todayStr,
      mealType: "夕食",
      description: defaultDescription,
      calories: "",
    });
  }, [defaultDate, defaultDescription, open, reset, todayStr]);

  const onValid = (data: FormValues) => {
    onAdd({
      date: data.date,
      mealType: data.mealType,
      description: data.description,
      calories: data.calories ? Number(data.calories) : undefined,
      recipeId,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className={styles.dialog}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>食事を記録する</DialogTitle>
          <DialogDescription>今日食べたものを記録しましょう</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className={styles.dialogForm}>
          <Stack gap="4">
            <Stack gap="2">
              <Text size="sm" weight="bold">日付</Text>
              <Input
                type="date"
                {...register("date")}
                error={errors.date?.message}
              />
            </Stack>

            <Stack gap="2">
              <Text size="sm" weight="bold">食事タイプ</Text>
              <Controller
                name="mealType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger error={errors.mealType?.message} />
                    <SelectContent className={styles.selectContent} data-theme="light">
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Stack>

            <Stack gap="2">
              <Text size="sm" weight="bold">内容</Text>
              <Input
                placeholder="例: 鶏むね肉のソテー、サラダ"
                {...register("description")}
                error={errors.description?.message}
              />
            </Stack>

            <Stack gap="2">
              <Text size="sm" weight="bold">カロリー（任意）</Text>
              <Input
                type="number"
                placeholder="例: 480"
                {...register("calories")}
              />
            </Stack>

            <DialogFooter className={styles.dialogFooter}>
              <Button type="button" variant="ghost" className={styles.cancelBtn} onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" variant="solid" className={styles.submitBtn}>
                記録する
              </Button>
            </DialogFooter>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
