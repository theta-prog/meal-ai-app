import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";
import { checkChatGuardrails, extractLatestUserText } from "@/lib/chat-guardrails";
import { buildSystemPrompt } from "@/lib/system-prompt";
import type { UserGoal } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const goalSchema = z.object({
  mode: z.enum(["cut", "bulk", "maintain"]),
  sex: z.enum(["male", "female"]),
  age: z.number(),
  heightCm: z.number(),
  currentWeight: z.number(),
  targetCalories: z.number(),
  proteinTargetG: z.number().optional(),
  targetWeight: z.number().optional(),
  trainingDaysPerWeek: z.number().optional(),
  timeframeWeeks: z.number().optional(),
});

export async function POST(req: Request) {
  let messages: UIMessage[];
  let goalRaw: unknown;

  try {
    const body = await req.json() as { messages: UIMessage[]; goal: unknown };
    messages = body.messages;
    goalRaw = body.goal;
  } catch {
    return Response.json(
      { error: "リクエストのJSONが不正です" },
      { status: 400 }
    );
  }

  const parsed = goalSchema.safeParse(goalRaw);
  if (!parsed.success) {
    return Response.json(
      { error: "目標プロフィールが設定されていません。設定画面でプロフィールを入力してください。" },
      { status: 400 }
    );
  }

  const goal = parsed.data as UserGoal;
  const systemPrompt = buildSystemPrompt(goal);
  const latestUserText = extractLatestUserText(messages);
  const guardrailResult = await checkChatGuardrails(latestUserText);

  if (guardrailResult.blocked) {
    return Response.json(
      { error: guardrailResult.message },
      { status: 400 }
    );
  }

  try {
    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model: google("gemini-3-flash-preview"),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 8192,
      onError: ({ error }) => {
        console.error("streamText error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("AI error:", message);

    if (message.includes("GOOGLE_GENERATIVE_AI_API_KEY") || message.includes("API key")) {
      return Response.json(
        { error: "APIキーが設定されていません。.env.local に GOOGLE_GENERATIVE_AI_API_KEY を設定してサーバーを再起動してください。" },
        { status: 503 }
      );
    }
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      return Response.json(
        { error: "AIのリクエスト上限に達しました。しばらく後に再試行してください。" },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "AIからの応答の取得に失敗しました。しばらく後にお試しください。" },
      { status: 502 }
    );
  }
}
