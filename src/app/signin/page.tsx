import { redirect } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Section,
  Stack,
  Text,
} from "@stella-ds/react";
import { auth, isGoogleAuthConfigured, signIn } from "@/auth";
import { ChefHatIcon } from "@/components/ChefHatIcon";
import styles from "./signin.module.css";

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
}

function normalizeCallbackUrl(callbackUrl: string | string[] | undefined) {
  const candidate = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  return candidate;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const redirectTo = normalizeCallbackUrl(params.callbackUrl);

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <Section size="md" className={styles.pageSection}>
      <div className={styles.pageShell}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.iconWrap} aria-hidden="true">
              <ChefHatIcon className={styles.icon} />
            </div>
            <Badge variant="subtle" color="default" size="sm">
              Meal AI
            </Badge>
            <Stack gap="2" align="center">
              <Heading level={1} size="lg">
                Google でログイン
              </Heading>
              <Text size="sm" color="secondary" className={styles.description}>
                食事プラン、保存レシピ、食事記録を使うには Google アカウントでの認証が必要だよ。
              </Text>
            </Stack>
          </CardHeader>

          <CardContent className={styles.cardContent}>
            {isGoogleAuthConfigured ? (
              <>
                <form
                  className={styles.actionForm}
                  action={async () => {
                    "use server";
                    await signIn("google", { redirectTo });
                  }}
                >
                  <Button type="submit" variant="solid" size="md" className={styles.primaryButton}>
                    Googleでログイン
                  </Button>
                </form>
                <Text size="xs" color="secondary" className={styles.footnote}>
                  ログイン後は元のページに戻って、そのまま使い始められるよ。
                </Text>
              </>
            ) : (
              <div className={styles.configNotice} role="status">
                <Text size="sm" weight="bold">
                  OAuth の環境変数がまだ未設定
                </Text>
                <Text size="sm" color="secondary">
                  .env.local に AUTH_GOOGLE_ID、AUTH_GOOGLE_SECRET、AUTH_SECRET を設定してから使ってね。
                </Text>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}