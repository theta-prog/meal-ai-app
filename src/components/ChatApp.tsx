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
import styles from "./ChatApp.module.css";

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
        <div className={styles.appSection}>
          <div className={styles.chatLayout}>
            <div className={styles.appShell}>
              <Header className={styles.appHeader}>
                <HeaderBrand className={styles.appHeaderBrand}>
                  <div className={styles.appHeaderIntro}>
                    <div className={styles.appMark} aria-hidden="true">
                      <ChefHatIcon className={styles.appMarkIcon} />
                    </div>
                    <div className={styles.appHeaderCopy}>
                      <Badge variant="subtle" color="default" size="sm" className={styles.appHeaderBadge}>
                        Meal AI
                      </Badge>
                      <Heading level={1} size="lg">魔法のパティシエ</Heading>
                      <Text size="sm" color="secondary" className={styles.appHeaderNote}>
                        目標に合わせて、毎日の食事をやさしく整えるメニューコンシェルジュ
                      </Text>
                      {goal && (
                        <Stack direction="horizontal" gap="2" align="center" className={styles.appHeaderMetrics}>
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
                <HeaderActions className={styles.appHeaderActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.appHeaderAction}
                    onClick={() => setGoalSetupOpen(true)}
                  >
                    目標を編集
                  </Button>
                </HeaderActions>
              </Header>

              <Tabs
                defaultValue="chat"
                variant="solid"
                className={styles.appTabs}
                style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
              >
                <TabsList className={styles.appTabsList}>
                  <TabsTrigger value="chat" className={styles.appTabsTrigger}>チャット</TabsTrigger>
                  <TabsTrigger value="gallery" className={styles.appTabsTrigger}>
                    ギャラリー
                    {recipes.length + shoppingLists.length > 0 && (
                      <Badge variant="subtle" color="primary" size="sm" className={styles.tabCount}>
                        {recipes.length + shoppingLists.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="log" className={styles.appTabsTrigger}>
                    食事記録
                    {sortedDates.length > 0 && (
                      <Badge variant="subtle" color="primary" size="sm" className={styles.tabCount}>
                        {sortedDates.length}日
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="chat"
                  className={`${styles.appTabsContent} ${styles.appTabsContentChat}`}
                  style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
                >
                  <main className={styles.chatMain}>
                    <ChatWindow
                      messages={messages}
                      isLoading={isLoading}
                      error={error}
                      onSaveMessage={saveRecipe}
                    />
                  </main>
                  <footer className={styles.chatFooter}>
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
                  className={`${styles.appTabsContent} ${styles.appTabsContentPanel}`}
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
                  className={`${styles.appTabsContent} ${styles.appTabsContentPanel}`}
                  style={{ flex: 1, overflowY: "auto" }}
                >
                  <MealLogView
                    entriesByDate={entriesByDate}
                    sortedDates={sortedDates}
                    targetCalories={goal?.targetCalories}
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
