"use client";

import { useRef, KeyboardEvent } from "react";
import { Button } from "@stella-ds/react";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = ref.current?.value.trim();
    if (!text || isLoading || disabled) return;
    onSend(text);
    if (ref.current) ref.current.value = "";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputRow}>
      <textarea
        ref={ref}
        className={styles.textarea}
        placeholder={disabled ? "目標を設定してから話しかけてください" : "メッセージを入力… (Enter で送信、Shift+Enter で改行)"}
        onKeyDown={handleKeyDown}
        disabled={isLoading || disabled}
        rows={2}
      />
      <Button
        variant="solid"
        size="sm"
        onClick={handleSend}
        disabled={isLoading || disabled}
        loading={isLoading}
        aria-label="送信"
      >
        送信
      </Button>
    </div>
  );
}
