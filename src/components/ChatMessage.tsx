"use client";

import { useState } from "react";
import type { UIMessage } from "ai";
import { Button } from "@stella-ds/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChefHatIcon } from "@/components/ChefHatIcon";
import { detectSavedContentKind } from "@/lib/saved-content";
import styles from "./ChatMessage.module.css";
import markdownStyles from "./MarkdownContent.module.css";

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
  const userMessageClassName = `${styles.message} ${styles.userMessage}`;
  const userBubbleClassName = `${styles.bubble} ${styles.userBubble}`;
  const assistantMessageClassName = `${styles.message} ${styles.assistantMessage}`;
  const assistantBubbleClassName = `${styles.bubble} ${styles.assistantBubble}`;
  const markdownClassName = `${markdownStyles.markdown}${isStreaming ? ` ${markdownStyles.streaming}` : ""}`;

  if (message.role === "user") {
    return (
      <div className={userMessageClassName}>
        <div className={userBubbleClassName}>
          <p className={styles.bubbleText}>{textContent}</p>
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
    <div className={assistantMessageClassName}>
      <div className={styles.chefLabel}>
        <ChefHatIcon className={styles.chefIcon} />
        <span className={styles.chefName}>パティシエ</span>
      </div>
      <div className={assistantBubbleClassName}>
        <div className={markdownClassName}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className={markdownStyles.h1}>{children}</h1>,
              h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
              h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
              p: ({ children }) => <p className={markdownStyles.paragraph}>{children}</p>,
              strong: ({ children }) => <strong className={markdownStyles.strong}>{children}</strong>,
              ul: ({ children }) => <ul className={markdownStyles.unorderedList}>{children}</ul>,
              ol: ({ children }) => <ol className={markdownStyles.orderedList}>{children}</ol>,
              li: ({ children }) => <li className={markdownStyles.listItem}>{children}</li>,
              code: ({ children, className }) => {
                const isBlock = className?.includes("language-");
                return isBlock
                  ? <code className={markdownStyles.codeBlock}>{children}</code>
                  : <code className={markdownStyles.inlineCode}>{children}</code>;
              },
              pre: ({ children }) => <pre className={markdownStyles.preformatted}>{children}</pre>,
              table: ({ children }) => (
                <div className={markdownStyles.tableWrap}>
                  <table className={markdownStyles.table}>{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className={markdownStyles.thead}>{children}</thead>,
              th: ({ children }) => <th className={markdownStyles.th}>{children}</th>,
              td: ({ children }) => <td className={markdownStyles.td}>{children}</td>,
            }}
          >
            {textContent}
          </ReactMarkdown>
        </div>

        {!isStreaming && onSave && savedKind !== "none" && (
          <Button
            variant="outline"
            size="sm"
            className={saved ? `${styles.saveBtn} ${styles.saveBtnSaved}` : styles.saveBtn}
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
