"use client";

import { useEffect, useRef, useState } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollState = () => {
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollByAmount = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const amount = Math.max(track.clientWidth * 0.72, 220);
    track.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="quick-actions-shell">
      <Button
        variant="ghost"
        size="sm"
        className="quick-actions-nav"
        onClick={() => scrollByAmount("left")}
        disabled={disabled || !canScrollLeft}
        type="button"
        aria-label="質問例を左にスクロール"
      >
        {"<"}
      </Button>

      <div className="quick-actions" ref={trackRef}>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            className="quick-chip"
            onClick={() => onSelect(action)}
            disabled={disabled}
            type="button"
          >
            {action}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="quick-actions-nav"
        onClick={() => scrollByAmount("right")}
        disabled={disabled || !canScrollRight}
        type="button"
        aria-label="質問例を右にスクロール"
      >
        {">"}
      </Button>
    </div>
  );
}
