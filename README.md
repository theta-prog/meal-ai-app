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
DATABASE_URL=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=
GOOGLE_GENERATIVE_AI_API_KEY=
```

3. Google Cloud Console の OAuth 設定で、承認済みリダイレクト URI に次を追加

```text
http://localhost:3000/api/auth/callback/google
```

4. DB スキーマを反映

```bash
npm run db:push
```

5. 開発サーバーを起動

```bash
npm run dev
```

- 通常のローカル開発は `npm run dev` を使ってください。
- Cloudflare のローカル runtime を明示的に噛ませたい場合だけ `npm run dev:cloudflare` を使います。
- `npm run dev:cloudflare` は `workerd` が起動できる環境を前提にするため、Linux では glibc のバージョン差で失敗することがあります。その場合は通常の `npm run dev` と `npm run preview` を使い分けるのが安全です。

6. 型チェック

```bash
npm run typecheck
```

7. Cloudflare Workers 上でのローカル確認

```bash
npm run preview
```

## 認証まわり

- 未認証ユーザーは `/signin` にリダイレクトされます。
- `/api/chat` と `/api/meal-suggestions` は未認証時に 401 を返します。
- `.env.local` に OAuth 設定がない場合、サインイン画面に案内メッセージが表示されます。

## 補足

- Next.js 16 の `proxy.ts` を使ってページ側の認証導線を制御しています。
- Auth.js は `next-auth@beta` を使用しています。
- Auth.js とアプリ内データは Postgres + Drizzle 経由で永続化しています。
- ローカル起動では `DATABASE_URL` の設定と `npm run db:push` が必須です。

## Cloudflare Workers へのデプロイ

- このリポジトリは `@opennextjs/cloudflare` + `wrangler` 前提で Cloudflare Workers にデプロイできます。
- ローカルで Workers ランタイムを確認するには `npm run preview` を使います。
- 手元からデプロイする場合は `npm run deploy` を実行します。

### GitHub Actions での自動デプロイ

- `.github/workflows/cloudflare-deploy.yml` で、Pull Request と push 時に `typecheck` / `build` を実行します。
- `main` への push または `workflow_dispatch` で Cloudflare Workers へ自動デプロイします。
- GitHub リポジトリの Secrets / Variables に最低限次を設定してください。

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
DATABASE_URL
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_SECRET
GOOGLE_GENERATIVE_AI_API_KEY
```

- `CLOUDFLARE_API_TOKEN` は Cloudflare Workers を更新できる権限に絞って作るのがおすすめです。
- workflow は GitHub Secrets の値を Worker secrets に同期してから `wrangler deploy` を実行します。
- Google Cloud Console の OAuth 設定には、本番用のリダイレクト URI として `https://<your-worker-domain>/api/auth/callback/google` も追加してください。
