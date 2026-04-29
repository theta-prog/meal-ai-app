# Meal AI App

食事プラン提案、レシピ保存、食事記録をまとめた Next.js アプリです。

設計メモは [docs/oauth-backend-notes.md](docs/oauth-backend-notes.md) を参照。

## セットアップ

1. 依存をインストール

```bash
npm install
```

2. `.env.local` を作成して、最低限次の値を設定

```bash
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_API_KEY=
```

3. Google Cloud Console の OAuth 設定で、承認済みリダイレクト URI に次を追加

```text
http://localhost:3000/api/auth/callback/google
```

4. 開発サーバーを起動

```bash
npm run dev
```

5. 型チェック

```bash
npm run typecheck
```

## 認証まわり

- 未認証ユーザーは `/signin` にリダイレクトされます。
- `/api/chat` と `/api/meal-suggestions` は未認証時に 401 を返します。
- `.env.local` に OAuth 設定がない場合、サインイン画面に案内メッセージが表示されます。

## 補足

- Next.js 16 の `proxy.ts` を使ってページ側の認証導線を制御しています。
- Auth.js は `next-auth@beta` を使用しています。
- 現在の保存データは localStorage ベースです。DB 導入の次段メモは [docs/oauth-backend-notes.md](docs/oauth-backend-notes.md) にまとめています。
