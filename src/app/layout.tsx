import type { Metadata } from "next";
import "./globals.css";
import { Badge, Background, Button, Section, Stack, Text } from "@stella-ds/react";
import { auth, signOut } from "@/auth";
import { ClientProviders } from "@/components/ClientProviders";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "Meal AI - 魔法のパティシエが食事プランを提案",
  description: "目標体重やカロリーから、AIが最適な食事プランとレシピを提案します",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="ja">
      <body>
        <Background variant="solid" color="mixed" theme="light">
          <ClientProviders>
            <div className={styles.pageFrame}>
              {user && (
                <Section size="md" className={styles.toolbarSection}>
                  <div className={styles.toolbar}>
                    <Stack gap="1" className={styles.userMeta}>
                      <Badge variant="subtle" color="default" size="sm">
                        ログイン中
                      </Badge>
                      <Text size="sm" weight="medium" className={styles.userName}>
                        {user.name ?? "Googleユーザー"}
                      </Text>
                      {user.email && (
                        <Text size="xs" color="secondary" className={styles.userEmail}>
                          {user.email}
                        </Text>
                      )}
                    </Stack>

                    <form
                      className={styles.logoutForm}
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/signin" });
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        ログアウト
                      </Button>
                    </form>
                  </div>
                </Section>
              )}

              {children}
            </div>
          </ClientProviders>
        </Background>
      </body>
    </html>
  );
}
