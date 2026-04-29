"use client";

import { useState, type CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@stella-ds/react";
import type { SavedRecipe } from "@/types/storage";
import { LogMealDialog } from "@/components/LogMealDialog";
import type { MealLogEntry } from "@/types/storage";
import styles from "./RecipeGallery.module.css";
import markdownStyles from "./MarkdownContent.module.css";

interface RecipeGalleryProps {
  recipes: SavedRecipe[];
  shoppingLists: SavedRecipe[];
  onDelete: (id: string) => void;
  onLogMeal: (input: Omit<MealLogEntry, "id" | "loggedAt">) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

interface RecipeCardProps {
  recipe: SavedRecipe;
  onDelete: (id: string) => void;
  onLogMeal: (input: Omit<MealLogEntry, "id" | "loggedAt">) => void;
}

const emptyStateStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: "var(--stella-spacing-3)",
  padding: "var(--stella-spacing-10) var(--stella-spacing-8)",
};

const rootEmptyStateStyle: CSSProperties = {
  ...emptyStateStyle,
  padding: "var(--stella-spacing-12) var(--stella-spacing-8)",
};

const emptyStateIconStyle: CSSProperties = {
  fontSize: "2.5rem",
  lineHeight: 1,
};

function RecipeCard({ recipe, onDelete, onLogMeal }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const isShoppingList = recipe.kind === "shopping-list";

  return (
    <Card hoverable>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="start" gap="2" className={styles.cardHeaderRow}>
          <Stack gap="2" style={{ flex: 1 }}>
            <Badge
              variant="subtle"
              color={isShoppingList ? "success" : "default"}
              size="sm"
              style={{ width: "fit-content" }}
            >
              {isShoppingList ? "買い物リスト" : "レシピ"}
            </Badge>
            <Heading level={3} size="md" weight="semibold" className={styles.cardTitle}>
              {recipe.title}
            </Heading>
          </Stack>
          <Stack direction="horizontal" align="center" gap="2" className={styles.cardMeta}>
            <Badge variant="subtle" color="default" size="sm">
              {formatDate(recipe.savedAt)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(recipe.id)}
              aria-label="削除"
            >
              ✕
            </Button>
          </Stack>
        </Stack>
      </CardHeader>

      {expanded && (
        <CardContent
          className={`${styles.expandedContent} ${markdownStyles.markdown}`}
        >
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
            {recipe.content}
          </ReactMarkdown>
        </CardContent>
      )}

      <CardFooter className={styles.cardFooter}>
        <Stack direction="horizontal" gap="2" className={styles.cardActions}>
          {!isShoppingList && (
            <Button variant="outline" size="md" onClick={() => setLogOpen(true)}>
              食事に記録
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "閉じる" : isShoppingList ? "リストを見る" : "レシピを見る"}
          </Button>
        </Stack>
      </CardFooter>

      {!isShoppingList && (
        <LogMealDialog
          open={logOpen}
          onOpenChange={setLogOpen}
          onAdd={onLogMeal}
          defaultDescription={recipe.title}
          recipeId={recipe.id}
        />
      )}
    </Card>
  );
}

function GalleryEmptyState({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div style={emptyStateStyle}>
      <div style={emptyStateIconStyle}>{icon}</div>
      <Text size="md" weight="bold">{title}</Text>
      <Text size="sm" color="secondary">
        {description}
      </Text>
    </div>
  );
}

export function RecipeGallery({ recipes, shoppingLists, onDelete, onLogMeal }: RecipeGalleryProps) {
  if (recipes.length === 0 && shoppingLists.length === 0) {
    return (
      <div style={rootEmptyStateStyle}>
        <div style={emptyStateIconStyle}>📖</div>
        <Text size="md" weight="bold">保存したコンテンツがありません</Text>
        <Text size="sm" color="secondary">
          チャットでパティシエに料理を提案してもらい、
          レシピや買い物リストを保存するとここに分かれて並びます。
        </Text>
      </div>
    );
  }

  const defaultTab = recipes.length > 0 ? "recipes" : "shopping-lists";

  return (
    <Tabs defaultValue={defaultTab} variant="line" style={{ paddingTop: "var(--stella-spacing-4)" }}>
      <TabsList className={styles.tabsList}>
        <TabsTrigger value="recipes" className={styles.tabsTrigger}>
          レシピ
          <Badge variant="subtle" color="default" size="sm" className={styles.tabCount}>
            {recipes.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="shopping-lists" className={styles.tabsTrigger}>
          買い物リスト
          <Badge variant="subtle" color="default" size="sm" className={styles.tabCount}>
            {shoppingLists.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="recipes" className={styles.content}>
        {recipes.length === 0 ? (
          <GalleryEmptyState
            icon="🍳"
            title="保存したレシピはまだありません"
            description="料理提案を保存すると、ここにレシピだけがまとまって残ります。"
          />
        ) : (
          <Stack gap="3" style={{ paddingTop: "var(--stella-spacing-4, 1rem)" }}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} onLogMeal={onLogMeal} />
            ))}
          </Stack>
        )}
      </TabsContent>

      <TabsContent value="shopping-lists" className={styles.content}>
        {shoppingLists.length === 0 ? (
          <GalleryEmptyState
            icon="🛒"
            title="保存した買い物リストはまだありません"
            description="買い物リストを保存すると、レシピとは別の保存先としてここに並びます。"
          />
        ) : (
          <Stack gap="3" style={{ paddingTop: "var(--stella-spacing-4, 1rem)" }}>
            {shoppingLists.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} onLogMeal={onLogMeal} />
            ))}
          </Stack>
        )}
      </TabsContent>
    </Tabs>
  );
}
