"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@stella-ds/react";
import { Button } from "@stella-ds/react";

interface QuickActionsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

const QUICK_ACTIONS = [
  "今日の夕食を提案して",
  "朝食のレシピを教えて",
  "高タンパクな昼食は？",
  "今週の買い物リストを作って",
  "冷蔵庫の余り物でできる料理",
  "今日の全食事プランを提案して",
] as const;

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <Carousel aria-label="クイック質問" slideAlign="start">
      <CarouselContent style={{ paddingBlock: "0.15rem" }}>
        {QUICK_ACTIONS.map((action) => (
          <CarouselItem key={action} style={{ flex: "0 0 auto", width: "auto" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(action)}
              disabled={disabled}
              type="button"
              style={{ borderRadius: "9999px", fontSize: "0.75rem", whiteSpace: "nowrap" }}
            >
              {action}
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
        <CarouselPrevious disabled={disabled} />
        <CarouselNext disabled={disabled} />
      </div>
    </Carousel>
  );
}
