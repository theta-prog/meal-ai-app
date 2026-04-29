# OAuth / Backend Notes (2026-04-29)

## 現時点の判断

- Google の OAuth 表示名は、個人開発の複数アプリで包括的な名前を使ってよい
- ただし OAuth クライアント ID はアプリごとに分ける
- アプリ間でユーザー統合やデータ共通化は、現時点では行わない
- 同じ Google アカウントでログインしても、アプリ内データが自動で混ざることはない

## なぜデータが勝手に混ざらないか

- Google が返すプロフィール情報は同じ本人として扱われる
- ただしセッション、DB、localStorage、Cookie はアプリ側の実装次第であり、Google OAuth 自体は共有しない
- そのため、保存先を分けていれば別アプリのデータと衝突しない

## 現在の Meal AI の状態

- 認証は Auth.js + Google OAuth で行っている
- ページ側は `src/proxy.ts` で未認証アクセスを `/signin` に寄せている
- API 側は `/api/chat` と `/api/meal-suggestions` で認証チェック済み
- ただしアプリデータはまだブラウザの localStorage に保存している

現在 localStorage に残しているもの:

- 目標プロフィール: `src/hooks/useUserGoal.ts`
- 保存したレシピ/買い物リスト: `src/hooks/useSavedRecipes.ts`
- 食事ログ: `src/hooks/useMealLog.ts`

この状態では、ログインはできても次の制約が残る:

- 別ブラウザ/別端末ではデータが見えない
- ブラウザストレージを消すとデータも消える
- サーバー側でユーザー単位の一貫したデータ管理ができない

## 次に必要な整備

### 1. DB の導入

最低限、次のどれかを保存できるようにする:

- Auth.js のユーザー/アカウント/セッション
- 目標プロフィール
- 保存したレシピ/買い物リスト
- 食事ログ

### 2. ユーザー識別のサーバー側統一

選択肢は2つある:

- Auth.js の JWT セッションは維持しつつ、Google のユーザー識別子をアプリ側 user レコードへ結びつける
- Auth.js adapter を導入して、users / accounts / sessions も DB 管理に寄せる

後で管理を楽にしたいなら、DB 導入のタイミングで adapter も検討するのが自然。

### 3. クライアント保存の置き換え

- `useUserGoal`
- `useSavedRecipes`
- `useMealLog`

この3つを localStorage 依存から、認証済み API または Server Actions 経由の永続化へ切り替える。

### 4. 必要なら初回インポートを用意

既存ユーザーのブラウザ内データを消したくないなら、初回ログイン時だけ localStorage から DB に取り込むワンタイム処理を入れる。

## PR の切り方

分けるなら、次の2本がきれい。

### PR 1: バックエンド基盤

- DB 選定
- スキーマ定義
- マイグレーション
- Auth.js adapter 追加または app user 紐付け実装
- 認証済みデータ API の追加

### PR 2: クライアント移行

- localStorage hooks の置き換え
- 初回インポートの UX
- エラー表示やロード状態の調整

小さく進めるなら PR を分ける方がレビューしやすい。

## 運用メモ

- OAuth の表示名を包括名にしても、データ保存先を分けていればアプリ内データは混ざらない
- 逆に、同じ DB や同じ Cookie 名、同じ localStorage キーを雑に共有すると衝突しうる
- 今後 DB を共有する場合でも、アプリ単位または user_id 単位の境界は明示する