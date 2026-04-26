"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { Skeleton, Stack, Text } from "@stella-ds/react";
import { ChefHatIcon } from "@/components/ChefHatIcon";
import { ChatMessage } from "@/components/ChatMessage";
import { ErrorBanner } from "@/components/ErrorBanner";

interface ChatWindowProps {
  messages: UIMessage[];
  isLoading: boolean;
  error?: Error | null;
  onSaveMessage?: (content: string) => void;
}

export function ChatWindow({ messages, isLoading, error, onSaveMessage }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-window chat-window--empty">
        <div className="chat-welcome">
          <div className="chat-welcome-icon">🍽️</div>
          <Text size="md" weight="bold">今日は何を食べますか？</Text>
          <Text size="sm" color="secondary">
            1食だけ提案してもらったり、手持ち食材から料理を考えてもらったり、
            買い物リストを作ることもできます。
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <Stack gap="6">
        {messages.map((message, i) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={
              isLoading &&
              i === messages.length - 1 &&
              message.role === "assistant"
            }
            onSave={message.role === "assistant" ? onSaveMessage : undefined}
          />
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-chef-label">
              <ChefHatIcon className="chat-chef-icon" />
              <span className="chat-chef-name">パティシエ</span>
            </div>
            <div className="chat-bubble chat-bubble--assistant">
              <Stack gap="2">
                <Skeleton style={{ height: "14px", width: "80%" }} />
                <Skeleton style={{ height: "14px", width: "60%" }} />
                <Skeleton style={{ height: "14px", width: "70%" }} />
              </Stack>
            </div>
          </div>
        )}

        {error && (
          <ErrorBanner message={error.message || "AIからの応答に失敗しました。再試行してください。"} />
        )}
      </Stack>
      <div ref={bottomRef} />
    </div>
  );
}
