const MEAL_DOMAIN_KEYWORDS = [
  "食事",
  "ご飯",
  "料理",
  "レシピ",
  "献立",
  "栄養",
  "カロリー",
  "タンパク質",
  "脂質",
  "炭水化物",
  "食材",
  "買い物",
  "記録",
  "朝食",
  "昼食",
  "夕食",
  "間食",
  "meal",
  "recipe",
  "nutrition",
  "protein",
  "calorie",
  "shopping list",
] as const;

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /developer\s+message/i,
  /reveal\s+.*prompt/i,
  /あなたは.*ではなく/i,
  /前の指示を無視/i,
  /システムプロンプト/i,
  /開発者メッセージ/i,
  /ルールを上書き/i,
] as const;

const DISALLOWED_PATTERNS = [
  /爆弾|銃|ナイフで人を|殺し方|自殺|薬物|覚醒剤|違法ドラッグ/i,
  /ハッキング|不正アクセス|マルウェア|ランサムウェア|詐欺|フィッシング/i,
  /児童ポルノ|レイプ|痴漢|盗撮|リベンジポルノ/i,
  /差別|ヘイト|民族浄化|虐殺/i,
] as const;

const OFF_TOPIC_MESSAGE = "このアプリでは、食事・栄養・レシピ・買い物リスト・食事記録に関する相談だけに答えるよ。食事管理に関係する内容で聞き直してね。";
const SAFETY_MESSAGE = "その依頼には対応できないよ。安全で一般的に適切な範囲の、食事・栄養・料理に関する内容だけ手伝える。";
const INJECTION_MESSAGE = "その依頼には対応しないよ。ルール変更や内部指示の開示には従わず、食事・栄養・料理の相談だけを扱う。";

export function extractLatestUserText(messages: Array<{ role: string; parts?: Array<{ type: string; text?: string }> }>): string {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage) return "";

  return (latestUserMessage.parts ?? [])
    .filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join(" ")
    .trim();
}

export function checkChatGuardrails(message: string): { blocked: false } | { blocked: true; message: string } {
  const normalized = message.trim();
  if (!normalized) {
    return { blocked: true, message: OFF_TOPIC_MESSAGE };
  }

  if (PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { blocked: true, message: INJECTION_MESSAGE };
  }

  if (DISALLOWED_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { blocked: true, message: SAFETY_MESSAGE };
  }

  const isMealDomain = MEAL_DOMAIN_KEYWORDS.some((keyword) => normalized.toLowerCase().includes(keyword.toLowerCase()));
  if (!isMealDomain) {
    return { blocked: true, message: OFF_TOPIC_MESSAGE };
  }

  return { blocked: false };
}