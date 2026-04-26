"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { Button } from "@stella-ds/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChefHatIcon } from "@/components/ChefHatIcon";
import { detectSavedContentKind } from "@/lib/saved-content";

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  onSave?: (content: string) => void;
}

export function ChatMessage({ message, isStreaming, onSave }: ChatMessageProps) {
  const [saved, setSaved] = useState(false);

  const textContent = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
  const savedKind = detectSavedContentKind(textContent);
  const saveLabel = savedKind === "shopping-list" ? "＋ 買い物リストに保存" : "＋ レシピに保存";
  const savedLabel = savedKind === "shopping-list" ? "✓ 買い物リスト保存済み" : "✓ レシピ保存済み";

  if (message.role === "user") {
    return (
      <div className="chat-msg chat-msg--user">
        <div className="chat-bubble chat-bubble--user">
          <p className="chat-bubble-text">{textContent}</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (saved || !onSave) return;
    onSave(textContent);
    setSaved(true);
  };

  return (
    <div className="chat-msg chat-msg--assistant">
      <div className="chat-chef-label">
        <ChefHatIcon className="chat-chef-icon" />
        <span className="chat-chef-name">パティシエ</span>
      </div>
      <div className={`chat-bubble chat-bubble--assistant${isStreaming ? " chat-bubble--streaming" : ""}`}>
        <div className="chat-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
              h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              p: ({ children }) => <p className="md-p">{children}</p>,
              strong: ({ children }) => <strong className="md-strong">{children}</strong>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                return isBlock
                  ? <code className="md-code-block">{children}</code>
                  : <code className="md-code">{children}</code>;
              },
              pre: ({ children }) => <pre className="md-pre">{children}</pre>,
              table: ({ children }) => (
                <div className="md-table-wrap">
                  <table className="md-table">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="md-thead">{children}</thead>,
              th: ({ children }) => <th className="md-th">{children}</th>,
              td: ({ children }) => <td className="md-td">{children}</td>,
            }}
          >
            {textContent}
          </ReactMarkdown>
        </div>

        {!isStreaming && onSave && (
          <Button
            variant="outline"
            size="sm"
            className={`save-btn${saved ? " save-btn--saved" : ""}`}
            onClick={handleSave}
            disabled={saved}
            type="button"
            aria-label="レシピを保存"
          >
            {saved ? savedLabel : saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
