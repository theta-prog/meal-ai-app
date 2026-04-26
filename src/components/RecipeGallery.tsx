"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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

function RecipeCard({ recipe, onDelete, onLogMeal }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const isShoppingList = recipe.kind === "shopping-list";

  return (
    <Card hoverable className="saved-card">
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="start" gap="2">
          <Stack gap="2" style={{ flex: 1 }}>
            <Badge
              variant="subtle"
              color={isShoppingList ? "success" : "default"}
              size="sm"
              className="saved-card-kind"
            >
              {isShoppingList ? "買い物リスト" : "レシピ"}
            </Badge>
            <CardTitle style={{ flex: 1 }}>{recipe.title}</CardTitle>
          </Stack>
          <Stack direction="horizontal" align="center" gap="2">
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
          className="chat-markdown"
          style={{
            background: "var(--stella-color-void-base)",
            borderTop: "1px solid var(--stella-color-void-overlay)",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
              h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
              p: ({ children }) => <p className="md-p">{children}</p>,
              strong: ({ children }) => <strong className="md-strong">{children}</strong>,
              ul: ({ children }) => <ul className="md-ul">{children}</ul>,
              ol: ({ children }) => <ol className="md-ol">{children}</ol>,
              li: ({ children }) => <li className="md-li">{children}</li>,
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
            {recipe.content}
          </ReactMarkdown>
        </CardContent>
      )}

      <CardFooter>
        <Stack direction="horizontal" gap="2">
          {!isShoppingList && (
            <Button variant="outline" size="sm" onClick={() => setLogOpen(true)}>
              食事に記録
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
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
    <div className="empty-state saved-gallery-empty">
      <div className="empty-state-icon">{icon}</div>
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
      <div className="empty-state">
        <div className="empty-state-icon">📖</div>
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
    <Tabs defaultValue={defaultTab} variant="solid" className="saved-gallery-tabs">
      <TabsList className="saved-gallery-tabs-list">
        <TabsTrigger value="recipes" className="saved-gallery-tabs-trigger">
          レシピ
          <span className="tab-count">{recipes.length}</span>
        </TabsTrigger>
        <TabsTrigger value="shopping-lists" className="saved-gallery-tabs-trigger">
          買い物リスト
          <span className="tab-count">{shoppingLists.length}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="recipes" className="saved-gallery-content">
        {recipes.length === 0 ? (
          <GalleryEmptyState
            icon="🍳"
            title="保存したレシピはまだありません"
            description="料理提案を保存すると、ここにレシピだけがまとまって残ります。"
          />
        ) : (
          <Stack gap="3" style={{ paddingTop: "var(--stella-spacing-4, 1rem)" }}>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={onDelete}
                onLogMeal={onLogMeal}
              />
            ))}
          </Stack>
        )}
      </TabsContent>

      <TabsContent value="shopping-lists" className="saved-gallery-content">
        {shoppingLists.length === 0 ? (
          <GalleryEmptyState
            icon="🛒"
            title="保存した買い物リストはまだありません"
            description="買い物リストを保存すると、レシピとは別の保存先としてここに並びます。"
          />
        ) : (
          <Stack gap="3" style={{ paddingTop: "var(--stella-spacing-4, 1rem)" }}>
            {shoppingLists.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={onDelete}
                onLogMeal={onLogMeal}
              />
            ))}
          </Stack>
        )}
      </TabsContent>
    </Tabs>
  );
}
