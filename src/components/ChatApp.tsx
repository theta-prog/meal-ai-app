"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Badge,
  Button,
  Header,
  HeaderBrand,
  HeaderActions,
  Heading,
  Section,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@stella-ds/react";
import { ChefHatIcon } from "@/components/ChefHatIcon";
import { useUserGoal } from "@/hooks/useUserGoal";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { useMealLog } from "@/hooks/useMealLog";
import { GoalSetup } from "@/components/GoalSetup";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions } from "@/components/QuickActions";
import { RecipeGallery } from "@/components/RecipeGallery";
import { MealLogView } from "@/components/MealLogView";

export function ChatApp() {
  const { goal, saveGoal, isLoaded } = useUserGoal();
  const [goalSetupOpen, setGoalSetupOpen] = useState(false);
  const { recipes, shoppingLists, saveRecipe, deleteRecipe } = useSavedRecipes();
  const { entriesByDate, sortedDates, addEntry, deleteEntry } = useMealLog();

  useEffect(() => {
    if (isLoaded && !goal) {
      setGoalSetupOpen(true);
    }
  }, [isLoaded, goal]);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSend = (text: string) => {
    if (!goal || isLoading) return;
    sendMessage({ text }, { body: { goal } });
  };

  if (!isLoaded) return null;

  const modeLabel = goal
    ? ({ cut: "減量", bulk: "増量", maintain: "維持" } as const)[goal.mode]
    : null;

  return (
    <>
      <GoalSetup
        initialGoal={goal}
        onSave={saveGoal}
        open={goalSetupOpen}
        onOpenChange={setGoalSetupOpen}
      />

      <Section size="md" style={{ maxWidth: "920px", margin: "0 auto" }}>
        <div className="app-section">
          <div className="chat-layout">
            <div className="app-shell">
              <Header className="app-header">
                <HeaderBrand className="app-header-brand">
                  <div className="app-header-intro">
                    <div className="app-mark" aria-hidden="true">
                      <ChefHatIcon className="app-mark-icon" />
                    </div>
                    <div className="app-header-copy">
                      <Badge variant="subtle" color="default" size="sm" className="app-header-badge">
                        Meal AI
                      </Badge>
                      <Heading level={1} size="lg">魔法のパティシエ</Heading>
                      <Text size="sm" color="secondary" className="app-header-note">
                        目標に合わせて、毎日の食事をやさしく整えるメニューコンシェルジュ
                      </Text>
                      {goal && (
                        <Stack direction="horizontal" gap="2" align="center" className="app-header-metrics">
                          <Badge variant="subtle" color="default" size="sm">
                            {modeLabel}
                          </Badge>
                          <Text size="xs" color="secondary">
                            目標 {goal.targetCalories.toLocaleString()} kcal / 日
                            {goal.proteinTargetG ? ` · P ${goal.proteinTargetG}g` : ""}
                          </Text>
                        </Stack>
                      )}
                    </div>
                  </div>
                </HeaderBrand>
                <HeaderActions className="app-header-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="app-header-action"
                    onClick={() => setGoalSetupOpen(true)}
                  >
                    目標を編集
                  </Button>
                </HeaderActions>
              </Header>

              <Tabs
                defaultValue="chat"
                variant="line"
                className="app-tabs"
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
              >
                <TabsList className="app-tabs-list">
                  <TabsTrigger value="chat" className="app-tabs-trigger">チャット</TabsTrigger>
                  <TabsTrigger value="gallery" className="app-tabs-trigger">
                ギャラリー
                {recipes.length + shoppingLists.length > 0 && (
                  <span className="tab-count">{recipes.length + shoppingLists.length}</span>
                )}
                  </TabsTrigger>
                  <TabsTrigger value="log" className="app-tabs-trigger">
                食事記録
                {sortedDates.length > 0 && (
                  <span className="tab-count">{sortedDates.length}日</span>
                )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="chat"
                  className="app-tabs-content app-tabs-content--chat"
                  style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
                >
                  <main className="chat-main">
                    <ChatWindow
                      messages={messages}
                      isLoading={isLoading}
                      error={error}
                      onSaveMessage={saveRecipe}
                    />
                  </main>
                  <footer className="chat-footer">
                    <QuickActions onSelect={handleSend} disabled={isLoading || !goal} />
                    <ChatInput
                      onSend={handleSend}
                      isLoading={isLoading}
                      disabled={!goal}
                    />
                  </footer>
                </TabsContent>

                <TabsContent
                  value="gallery"
                  className="app-tabs-content app-tabs-content--panel"
                  style={{ flex: 1, overflowY: "auto" }}
                >
                  <RecipeGallery
                    recipes={recipes}
                    shoppingLists={shoppingLists}
                    onDelete={deleteRecipe}
                    onLogMeal={addEntry}
                  />
                </TabsContent>

                <TabsContent
                  value="log"
                  className="app-tabs-content app-tabs-content--panel"
                  style={{ flex: 1, overflowY: "auto" }}
                >
                  <MealLogView
                    entriesByDate={entriesByDate}
                    sortedDates={sortedDates}
                    onDelete={deleteEntry}
                    onAdd={addEntry}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
