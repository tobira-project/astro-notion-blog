# TOBIRACAST サブスクリプション機能 実装ドキュメント

最終更新: 2025-10-06
作成者: ray
レビュー待ち: jonosuke, Inuta

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [要件定義](#要件定義)
3. [技術仕様](#技術仕様)
4. [実装状況](#実装状況)
5. [現在の問題点](#現在の問題点)
6. [次のステップ](#次のステップ)
7. [テスト手順](#テスト手順)
8. [デプロイ手順](#デプロイ手順)
9. [注意点・制約事項](#注意点制約事項)
10. [参考資料](#参考資料)

---

## プロジェクト概要

### 目的

Tobiratoryブログに月額サブスクリプション機能を実装し、限定コンテンツへのアクセス制御を行う。

### ビジネス要件

- **3つの料金プラン**を提供
  - ベーシック: ¥980/月
  - スタンダード: ¥1,980/月
  - プレミアム: ¥9,800/月
- **Stripe Checkout**を使用した決済フロー
- **Firebase UID**とStripe顧客情報の紐付け
- Notion記事内の限定コンテンツ表示制御

### スコープ

- ✅ Stripe決済フロー実装（Checkout Session）
- ✅ 成功/キャンセルページ
- ✅ 限定コンテンツ表示制御（Notion区切り線判定）
- ⏸️ Webhook処理（支払い完了通知受信）- DB設計承認待ち
- ⏸️ データベース設計・実装 - DB_DESIGN_PROPOSAL.md提出済み、承認待ち
- ⏸️ バックエンドAPI実装（tobiratory-webリポジトリ）
- ⏸️ マイページでのサブスクリプション状態表示

---

## 要件定義

### 機能要件

#### FR-01: プラン選択・決済

- **優先度**: 高
- **説明**: ユーザーが3つのプランから選択し、Stripe Checkoutで決済できる
- **受け入れ基準**:
  - ログイン済みユーザーのみプラン選択可能
  - プラン選択ボタンクリック後、Stripe Checkoutページへリダイレクト
  - テストカード（4242 4242 4242 4242）で決済可能
  - 決済成功時、/successページへリダイレクト
  - 決済キャンセル時、/cancelページへリダイレクト

#### FR-02: Webhook処理

- **優先度**: 高
- **説明**: Stripeから支払い完了通知を受信し、データベースを更新
- **受け入れ基準**:
  - `checkout.session.completed`イベントを受信
  - Webhook署名検証を実装
  - Firebase UIDとStripe Customer IDを紐付け
  - サブスクリプション状態をデータベースに保存
  - エラーログを記録

#### FR-03: データベース設計

- **優先度**: 高
- **説明**: サブスクリプション状態を管理するテーブル
- **受け入れ基準**:
  - `blog_accounts`テーブル作成
  - Firebase UIDとStripe IDの1対1リレーション
  - サブスクリプションステータス管理
  - プラン種別管理

#### FR-04: 限定コンテンツ表示制御

- **優先度**: 中
- **説明**: Notion記事内で、サブスクライバーのみに表示するコンテンツを制御
- **受け入れ基準**:
  - Notion Dividerブロック以降を限定コンテンツとする
  - 非サブスクライバーには「続きを読むには会員登録が必要です」を表示
  - サブスクライバーには全文表示

#### FR-05: マイページ表示

- **優先度**: 低
- **説明**: ユーザーのサブスクリプション状態を表示
- **受け入れ基準**:
  - 現在のプラン名表示
  - 次回請求日表示
  - プラン変更リンク
  - 解約リンク

### 非機能要件

#### NFR-01: セキュリティ

- Stripe Secret Keyは環境変数で管理（.envファイル、gitignore済み）
- Webhook署名検証必須
- Firebase AuthenticationでAPI保護

#### NFR-02: パフォーマンス

- Checkout Session作成は500ms以内
- Webhook処理は1秒以内

#### NFR-03: 可用性

- Stripe障害時のエラーハンドリング
- Webhook失敗時のリトライ機能（Stripe側で自動実行）

---

## 技術仕様

### アーキテクチャ

```
[ブラウザ]
    ↓ 1. プラン選択
[Astro Frontend (subscription.astro)]
    ↓ 2. POST /api/create-checkout-session
[Astro API Endpoint]
    ↓ 3. Stripe API呼び出し
[Stripe Checkout Session]
    ↓ 4. ユーザーが決済
[Stripe]
    ↓ 5. Webhook送信
[Astro API Endpoint (/api/stripe-webhook)]
    ↓ 6. DB更新
[Prisma + PostgreSQL]
```

### 技術スタック

| 領域           | 技術              | バージョン            |
| -------------- | ----------------- | --------------------- |
| フロントエンド | Astro             | 5.1.3                 |
| 決済           | Stripe            | API 2024-12-18.acacia |
| 認証           | Firebase Auth     | 12.3.0                |
| データベース   | PostgreSQL (予定) | -                     |
| ORM            | Prisma (予定)     | -                     |
| デプロイ       | Cloudflare Pages  | -                     |

### Stripe設定

#### API Keys (テストモード)

```env
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...（実際の値は.envファイル参照）
STRIPE_SECRET_KEY=sk_test_xxx...（実際の値は.envファイル参照）
STRIPE_WEBHOOK_SECRET=whsec_xxx...（実際の値は.envファイル参照）
```

#### 商品・価格ID (テストモード)

```env
# ⚠️ 現在の問題: これらの価格IDがStripeアカウントに存在しない
PUBLIC_STRIPE_PRICE_ID_BASIC=price_1SF3bVAoGft584VGOby8ojwg      # ¥980/月
PUBLIC_STRIPE_PRICE_ID_STANDARD=price_1SF3c2AoGft584VGs2iFQNwA   # ¥1,980/月
PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_1SF3cwAoGft584VGuBgXS7I7    # ¥9,800/月
```

#### Webhook Endpoint

```
テストURL: https://tobiratory.com/blog/test/webhook/stripe
本番URL: https://astro-notion-blog-7kz.pages.dev/api/stripe-webhook
Webhook ID: we_1S851TALsNLSU9r2O7qTBijR
```

### データベーススキーマ (提案)

**詳細**: `DB_DESIGN_PROPOSAL.md` 参照

```prisma
// tobiratory-web/apps/firebase/functions/prisma/schema.prisma に追加

model blog_accounts {
  id                    Int       @id @default(autoincrement())
  account_uuid          String?   @db.VarChar(100)
  account               accounts? @relation(fields: [account_uuid], references: [uuid])

  // Stripe情報
  stripe_customer_id    String?   @unique @db.VarChar(255)
  stripe_subscription_id String?  @unique @db.VarChar(255)

  // サブスクリプション状態
  subscription_status   String?   @db.VarChar(50)  // active, canceled, past_due, etc.
  subscription_tier     String?   @db.VarChar(50)  // basic, standard, premium
  current_period_start  DateTime? @db.Timestamp(6)
  current_period_end    DateTime? @db.Timestamp(6)
  cancel_at_period_end  Boolean   @default(false)

  // 日時
  updated_date_time     DateTime  @default(now()) @db.Timestamp(6)
  created_date_time     DateTime  @default(now()) @db.Timestamp(6)
}

// accounts テーブルに以下を追加
model accounts {
  // ... 既存のフィールド ...
  blog_account          blog_accounts?
}
```

**重要**:

- tobiratory-webプロジェクトのschema.prismaと整合性を保つ必要がある
- account_uuidはnullable（accountsテーブルのレコード削除時も対応）
- マイグレーション実行はjonosuke/Inutaが担当

### API仕様

#### POST /api/create-checkout-session

**Request:**

```json
{
  "priceId": "price_xxx",
  "userEmail": "user@example.com",
  "firebaseUid": "xxx"
}
```

**Response (成功):**

```json
{
  "sessionId": "cs_test_xxx"
}
```

**Response (エラー):**

```json
{
  "error": "エラーメッセージ"
}
```

#### POST /api/stripe-webhook (未実装)

**Headers:**

```
stripe-signature: t=xxx,v1=xxx
```

**Body:**

```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxx",
      "customer": "cus_xxx",
      "subscription": "sub_xxx",
      "metadata": {
        "firebaseUid": "xxx"
      }
    }
  }
}
```

---

## 実装状況

### ✅ 完了済み

#### 1. 環境変数設定

- **ファイル**: `.env`, `.env.example`
- **内容**:
  - Stripe API Keys設定
  - 価格ID設定（PUBLIC\_プレフィックス追加）
  - Webhook Secret設定
- **コミット**: `692c4b4`

#### 2. API Endpoint作成

- **ファイル**: `src/pages/api/create-checkout-session.ts`
- **機能**:
  - POSTリクエスト受付
  - priceId, userEmail, firebaseUidをバリデーション
  - Stripe Checkout Session作成
  - sessionIdをレスポンス
- **設定**: `export const prerender = false` で動的レンダリング有効化
- **注意**: デバッグログ含む（本番前に削除必要）

#### 3. フロントエンド実装

- **ファイル**: `src/pages/subscription.astro`
- **機能**:
  - 3つのプランカード表示
  - Firebase認証チェック
  - ログイン促進UI
  - Stripe.js統合
  - `/api/create-checkout-session`呼び出し
  - Checkoutページリダイレクト
  - エラーハンドリング

#### 4. 成功/キャンセルページ

- **ファイル**:
  - `src/pages/success.astro` - 決済成功ページ
  - `src/pages/cancel.astro` - 決済キャンセルページ
- **機能**:
  - 成功/キャンセル時のUI表示
  - マイページ/トップページへのリンク

#### 5. Astro設定変更

- **ファイル**: `astro.config.mjs`
- **変更**: `output: 'server'` に変更（APIエンドポイント有効化）
- **影響**: 本番ビルド時にアダプター必要（Cloudflare Pages用）

#### 6. パッケージ追加

- **パッケージ**: `stripe@^19.1.0`
- **コマンド**: `npm install stripe`

#### 7. 有料記事システム実装

- **ファイル**:
  - `src/lib/premium-content.ts` - 区切り線判定ロジック
  - `src/components/PremiumContentGate.astro` - ペイウォールUI
  - `src/pages/posts/[slug].astro` - 記事ページ統合
- **機能**:
  - Notion Dividerブロック検出
  - 無料部分と有料部分の自動分割
  - Firebase認証状態確認
  - 未ログイン/無料ユーザー向けペイウォール表示
  - 有料会員向けコンテンツ表示制御（DB実装後に有効化）
- **コミット**: `eb8eae1`

### ⏸️ 未実装

#### 1. Stripe商品・価格作成（上司確認待ち）

- **作業者**: jonosuke or Inuta
- **必要作業**:
  1. Stripeダッシュボードにログイン
  2. テストモードに切り替え
  3. 「商品」→「+ 商品を追加」
  4. 3つの商品作成:
     - ベーシック: ¥980/月（recurring）
     - スタンダード: ¥1,980/月（recurring）
     - プレミアム: ¥9,800/月（recurring）
  5. 各価格ID（`price_xxx`形式）をコピー
  6. `.env`ファイルを更新
- **URL**: https://dashboard.stripe.com/test/products

#### 2. バックエンドAPI実装（tobiratory-webリポジトリ）

**重要**: フロントエンド（astro-notion-blog）ではなく、バックエンド（tobiratory-web）にAPIを実装します。

##### a. Stripe Checkout Session作成API

- **ファイル**: `tobiratory-web/apps/firebase/functions/src/blog/create-checkout-session.ts`
- **エンドポイント**: `POST /blog/create-checkout-session`
- **機能**:
  - Firebase ID Token認証
  - Stripe Checkout Session作成
  - Firebase UIDをmetadataに含める
  - sessionIdを返却
- **依存**: なし（すぐ実装可能）

##### b. Stripe Webhook処理

- **ファイル**: `tobiratory-web/apps/firebase/functions/src/blog/stripe-webhook.ts`
- **エンドポイント**: `POST /blog/stripe-webhook`
- **必要機能**:
  - Webhook署名検証
  - `checkout.session.completed`イベント処理
  - `customer.subscription.updated`イベント処理
  - `customer.subscription.deleted`イベント処理
  - blog_accountsテーブル更新
  - エラーログ記録
- **依存**: DB実装完了後
- **参考コード**:

  ```typescript
  import type { APIRoute } from 'astro';
  import Stripe from 'stripe';

  export const prerender = false;

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });

  export const POST: APIRoute = async ({ request }) => {
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

    try {
      const body = await request.text();
      const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // TODO: データベース更新処理
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
      console.error('Webhook error:', err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
      });
    }
  };
  ```

#### 3. データベース実装

- **必要作業**:
  - Prismaインストール: `npm install @prisma/client prisma`
  - `schema.prisma`作成
  - `blog_accounts`テーブル作成
  - マイグレーション実行
- **未確認事項**:
  - 既存のPrismaスキーマ有無
  - PostgreSQLデータベース接続情報
  - tobiratory-webとのDB共有有無

#### 4. サブスクリプション状態確認API（tobiratory-webリポジトリ）

- **ファイル**: `tobiratory-web/apps/firebase/functions/src/blog/subscription-status.ts` (未作成)
- **エンドポイント**: `GET /blog/subscription-status`
- **必要機能**:
  - Firebase ID Tokenによる認証
  - blog_accountsテーブルからサブスクリプション状態取得
  - subscription_status === 'active' の判定
  - レスポンス返却
- **依存**: DB実装完了後
- **備考**: フロントエンド（PremiumContentGate.astro）からこのAPIを呼び出す

#### 5. マイページ統合

- **ファイル**: `src/pages/mypage.astro`
- **必要機能**:
  - サブスクリプション状態表示
  - プラン名表示
  - 次回請求日表示
  - プラン変更ボタン
  - 解約ボタン

#### 6. Stripeカスタマーポータル統合

- **目的**: ユーザーが自分でプラン変更・解約できる
- **必要作業**:
  - Customer Portal有効化（Stripeダッシュボード）
  - Portal Session作成APIエンドポイント
  - マイページにリンク追加

#### 7. デプロイ設定

- **Cloudflare Pages設定**:
  - 環境変数追加（本番用Stripe Keys）
  - ビルドコマンド確認
  - Astro Cloudflare Adapterインストール
- **Webhook URL更新**:
  - Stripeダッシュボードで本番Webhook URL登録

---

## 現在の問題点

### 🔴 Critical: Stripe価格IDが存在しない（上司確認中）

**問題**:

```
Error: No such price: 'price_1SF3c2AoGft584VGs2iFQNwA'
Error: No such price: 'price_1SF3bVAoGft584VGOby8ojwg'
Error: No such price: 'price_1SF3cwAoGft584VGuBgXS7I7'
```

**原因**:

- Keybaseで共有された価格ID（`stripe_blog_test_keys.txt`）がStripeアカウントに存在しない
- 可能性：
  1. Stripeダッシュボードがテストモードではなく本番モードになっている
  2. テストモードで商品が未作成
  3. 商品が削除済み
  4. 別のStripeアカウントの価格IDが共有された

**現在の設定**（Keybaseより）:

```
BASIC: price_1SF3bVAoGft584VGOby8ojwg (¥980/月)
STANDARD: price_1SF3c2AoGft584VGs2iFQNwA (¥1,980/月)
PREMIUM: price_1SF3cwAoGft584VGuBgXS7I7 (¥9,800/月)
```

**影響**:

- プラン選択ボタンをクリックしても500エラーが発生
- Stripe Checkoutページへ遷移できない
- **決済フロー全体が動作しない**
- **フロントエンド・有料記事システムは実装完了しているが、決済ができないため統合テスト不可**

**上司への確認内容** (2025-10-06送信):

```
問題の原因:
提供された価格ID（price_1SF3c2AoGft584VGs2iFQNwAなど）が、
このStripeアカウントに存在していません。

以下を確認してください:
1. Stripeダッシュボードにログイン:
   https://dashboard.stripe.com/test/products
2. テストモードになっているか確認:
   右上のトグルが「テストモード」になっているか
3. 商品一覧を確認:
   - ¥980, ¥1,980, ¥9,800の商品が実際に存在するか
   - 各商品の「価格ID」をクリックしてコピーし、
     keybaseで送ってくれたものと正しいか確認

次のステップ:
実際の価格IDを教えてください。
または、Stripeダッシュボードの商品一覧画面の
スクリーンショットを送ってください。
```

**解決方法**:

1. Stripeダッシュボードにアクセス: https://dashboard.stripe.com/test/products
2. 右上が「テストモード」になっているか確認
3. 3つの商品を作成（または既存商品の価格IDを確認）
4. **実際の価格ID**をKeybaseまたはSlackで共有
5. rayが`.env`ファイルを更新
6. サーバー再起動・動作確認

**担当**: jonosuke or Inuta（Stripe管理者のみアクセス可能）
**ステータス**: 確認待ち

### 🟡 Warning: デバッグログが残っている

**問題**:

```typescript
console.log('Received request:', { priceId, userEmail, firebaseUid });
console.log(
  'Stripe Secret Key:',
  import.meta.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...'
);
```

**影響**:

- 本番環境でユーザー情報がログに出力される
- セキュリティリスク

**解決方法**:
本番デプロイ前に以下を削除:

```bash
# src/pages/api/create-checkout-session.ts の14-15行目
```

### 🟡 Warning: Astro Adapter未インストール

**問題**:

```
[WARN] This project contains server-rendered routes, but no adapter is installed.
```

**影響**:

- 開発環境では問題なし
- **本番ビルド時にエラーが発生する可能性**

**解決方法**:

```bash
npm install @astrojs/cloudflare
```

```js
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // ...
});
```

---

## 上司の確認なしで実装可能なタスク

### ✅ すでに完了

1. ✅ 有料記事システム（Notion区切り線判定 + ペイウォールUI）
2. ✅ Stripe決済UI（subscription.astro）
3. ✅ API Endpoint（create-checkout-session.ts）
4. ✅ 成功/キャンセルページ

### 🔄 現在実装可能（上司確認不要）

#### 1. フロントエンドの改善

- マイページ（mypage.astro）のUI実装（API接続は後回し）
- ログイン後のユーザーメニュー改善
- エラーメッセージの日本語化
- レスポンシブデザインの調整

#### 2. ドキュメント整備

- ✅ SUBSCRIPTION.md作成（完了）
- ✅ DB_DESIGN_PROPOSAL.md作成（完了）
- API仕様書の詳細化
- テストケース一覧作成

#### 3. コード品質改善

- デバッグログの削除（create-checkout-session.ts:14-15）
- TypeScript型定義の追加
- エラーハンドリングの強化
- コメント追加

#### 4. テスト準備

- Stripe CLI のセットアップ手順書作成
- テストシナリオ作成
- テストデータ準備

### ⏸️ 上司の確認が必要

#### 1. Stripe価格ID確認（🔴 Critical）

- **ブロッカー**: 価格IDが存在しないため決済フロー全体が動作しない
- **必要な人**: jonosuke or Inuta
- **作業時間**: 10分程度

#### 2. DB設計承認（🔴 Critical）

- **ドキュメント**: DB_DESIGN_PROPOSAL.md
- **必要な人**: jonosuke
- **作業時間**: レビュー20分 + マイグレーション10分

#### 3. tobiratory-webへのAPI実装指示

- **内容**: どのリポジトリにバックエンドAPIを実装するか最終確認
- **必要な人**: jonosuke or Inuta

---

## 次のステップ

### フェーズ1: Stripe設定完了（上司作業）

**優先度**: 🔴 Critical
**担当**: jonosuke or Inuta
**期限**: ASAP

#### タスク:

1. [ ] Stripeダッシュボードでテストモード商品作成
   - ベーシック: ¥980/月
   - スタンダード: ¥1,980/月
   - プレミアム: ¥9,800/月
2. [ ] 各価格IDをrayに共有
3. [ ] `.env`ファイル更新（ray作業）
4. [ ] 動作確認（ray作業）

**成果物**: 決済フローが正常動作

---

### フェーズ2: Webhook実装（ray作業）

**優先度**: 🔴 Critical
**担当**: ray
**期限**: フェーズ1完了後すぐ

#### タスク:

1. [ ] `src/pages/api/stripe-webhook.ts` 作成
2. [ ] Webhook署名検証実装
3. [ ] `checkout.session.completed` イベント処理
4. [ ] ローカルでWebhook動作確認（Stripe CLI使用）
5. [ ] エラーハンドリング実装

**参考資料**:

- https://stripe.com/docs/webhooks
- https://stripe.com/docs/stripe-cli

**成果物**: Webhookイベント受信・処理が正常動作

---

### フェーズ3: データベース設計（チーム作業）

**優先度**: 🔴 Critical
**担当**: jonosuke, Inuta, ray
**期限**: フェーズ2完了後

#### タスク:

1. [ ] 既存DB設計確認（tobiratory-webとの整合性）
2. [ ] `schema.prisma` レビュー・承認
3. [ ] マイグレーション実行
4. [ ] Webhook処理にDB更新ロジック追加
5. [ ] 動作確認

**確認事項**:

- tobiratory-webと同じDBを使用するか？
- `accounts`テーブルは既存か？
- Prismaは既にセットアップ済みか？

**成果物**: サブスクリプション状態がDBに保存される

---

### フェーズ4: 限定コンテンツ制御（ray作業） ✅ 完了

**優先度**: 🟡 High
**担当**: ray
**期限**: フェーズ3完了後
**ステータス**: ✅ フロントエンド実装完了（DB連携待ち）

#### タスク:

1. [x] Notion Dividerブロック検出ロジック実装
2. [ ] サブスクリプション状態取得API実装（tobiratory-web側、DB実装後）
3. [x] ペイウォールUI実装
4. [ ] 動作確認（DB実装後）

**完了事項**:

- ✅ `src/lib/premium-content.ts` - 区切り線判定ロジック
- ✅ `src/components/PremiumContentGate.astro` - ペイウォールUI
- ✅ `src/pages/posts/[slug].astro` - 記事ページ統合
- ✅ Firebase認証状態確認
- ✅ 無料ユーザー向けペイウォール表示

**残タスク**:

- ⏸️ tobiratory-webに`/blog/subscription-status` API実装（DB実装後）
- ⏸️ PremiumContentGate.astroでAPI呼び出し有効化（コメントアウト済み）

**成果物**: 有料会員のみ限定コンテンツ閲覧可能（DB実装後に完全動作）

---

### フェーズ5: マイページ統合（ray作業）

**優先度**: 🟢 Medium
**担当**: ray
**期限**: フェーズ4完了後

#### タスク:

1. [ ] サブスクリプション状態表示
2. [ ] Stripe Customer Portal統合
3. [ ] プラン変更・解約リンク実装
4. [ ] 動作確認

**成果物**: ユーザーがマイページでサブスク管理可能

---

### フェーズ6: 本番デプロイ（チーム作業）

**優先度**: 🟢 Medium
**担当**: jonosuke, Inuta, ray
**期限**: 全フェーズ完了後

#### タスク:

1. [ ] Cloudflare Pages環境変数設定
2. [ ] Stripe本番モード設定
3. [ ] Webhook URL更新
4. [ ] デバッグログ削除
5. [ ] 本番環境で決済テスト
6. [ ] モニタリング設定

**成果物**: 本番環境で決済可能

---

## テスト手順

### ローカル開発環境テスト

#### 前提条件:

- Node.js 20.18.1
- npm
- Stripeアカウント（テストモード）
- Firebase認証設定済み

#### 手順:

1. **環境変数設定**

   ```bash
   cp .env.example .env
   # .env ファイルを編集し、実際のStripe Keysを設定
   ```

2. **依存関係インストール**

   ```bash
   npm install
   ```

3. **開発サーバー起動**

   ```bash
   NOTION_API_SECRET=xxx DATABASE_ID=xxx npm run dev -- --port 5000
   ```

4. **動作確認**
   - http://localhost:5000/ にアクセス
   - `/login` でログイン
   - `/subscription` でプラン選択
   - ボタンクリック
   - Stripe Checkoutページへリダイレクト確認

5. **テスト決済**
   - テストカード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
   - 郵便番号: 任意（例: 12345）
   - 決済完了後、`/success` へリダイレクト確認

6. **キャンセルテスト**
   - Checkoutページで「戻る」ボタンクリック
   - `/cancel` へリダイレクト確認

### Webhook ローカルテスト（フェーズ2実装後）

1. **Stripe CLI インストール**

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **ログイン**

   ```bash
   stripe login
   ```

3. **Webhookリスニング**

   ```bash
   stripe listen --forward-to localhost:5000/api/stripe-webhook
   ```

4. **テストイベント送信**

   ```bash
   stripe trigger checkout.session.completed
   ```

5. **ログ確認**
   - サーバーログでWebhook受信確認
   - データベース更新確認

---

## デプロイ手順

### Cloudflare Pages デプロイ

#### 前提条件:

- Cloudflare Pagesプロジェクト作成済み
- GitHubリポジトリ連携済み

#### 環境変数設定:

Cloudflare Pages ダッシュボード → Settings → Environment Variables

```
# Firebase
PUBLIC_FIREBASE_API_KEY=AIzaSyALE9B9ErxN6KjL8_aaW6Nj4w5L_kNtFjo
PUBLIC_FIREBASE_AUTH_DOMAIN=tobiratory-f6ae1.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tobiratory-f6ae1
PUBLIC_FIREBASE_STORAGE_BUCKET=tobiratory-f6ae1.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=578163240854
PUBLIC_FIREBASE_APP_ID=1:578163240854:web:97356353e9a439f4a177b7
PUBLIC_FIREBASE_MEASUREMENT_ID=G-BEZ2KWC3VE

# API
PUBLIC_API_URL=https://asia-northeast1-tobiratory-f6ae1.cloudfunctions.net

# Stripe（本番モード）
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # 本番キーに変更
STRIPE_SECRET_KEY=sk_live_xxx              # 本番キーに変更
STRIPE_WEBHOOK_SECRET=whsec_xxx            # 本番Webhook Secretに変更

# Stripe Price IDs（本番モード）
PUBLIC_STRIPE_PRICE_ID_BASIC=price_xxx
PUBLIC_STRIPE_PRICE_ID_STANDARD=price_xxx
PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxx

# Notion
NOTION_API_SECRET=xxx
DATABASE_ID=xxx

# Node
NODE_VERSION=20.18.1
```

#### ビルド設定:

```
Build command: npm run build
Build output directory: dist
Root directory: (default)
```

#### Webhook URL設定:

Stripeダッシュボード → Developers → Webhooks

1. 「+ エンドポイントを追加」
2. URL: `https://astro-notion-blog-7kz.pages.dev/api/stripe-webhook`
3. イベント選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Webhook署名シークレットをコピー
5. Cloudflare Pages環境変数に `STRIPE_WEBHOOK_SECRET` として追加

---

## 注意点・制約事項

### セキュリティ

#### 1. API Key管理

- ✅ `.env` ファイルは `.gitignore` に含める（済）
- ✅ GitHub push時にシークレットが含まれないようGitHub Secret Scanning有効
- ⚠️ `.env.example` にはプレースホルダーのみ記載

#### 2. Webhook検証

- 必須: Webhook署名検証を実装
- 非検証のWebhookは攻撃リスク

#### 3. HTTPS必須

- 本番環境では必ずHTTPS使用
- ローカル開発ではHTTPで警告が出るが問題なし

### パフォーマンス

#### 1. Astro出力モード

- `output: 'server'` により全ページが動的レンダリング
- 静的ページのパフォーマンス低下の可能性
- 対策: 将来的に `output: 'hybrid'` を検討（Astro v6で利用可能）

#### 2. Database接続

- Prismaコネクションプール設定必要
- Cloudflare Pagesの制約確認（コールドスタート対策）

### Stripe制約

#### 1. テストモードと本番モード

- テストモードの価格IDは本番モードで使用不可
- デプロイ時に必ず本番用価格IDに変更

#### 2. Webhook再送

- Stripeは失敗したWebhookを自動リトライ（最大3日間）
- 冪等性を考慮した実装必要

#### 3. 料金プラン変更

- 既存サブスクリプションのプラン変更は `subscription.update` API使用
- 即時変更 or 次回請求時変更を選択可能

### Cloudflare Pages制約

#### 1. リクエストタイムアウト

- 最大30秒
- Webhook処理は短時間で完了させる

#### 2. 環境変数サイズ

- 最大5KB
- 大量の環境変数を避ける

---

## 参考資料

### Stripe公式ドキュメント

- [Checkout Session API](https://stripe.com/docs/api/checkout/sessions)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)
- [テストカード](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

### Astro公式ドキュメント

- [API Routes](https://docs.astro.build/en/guides/endpoints/)
- [Server-side Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
- [Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)

### Firebase公式ドキュメント

- [Authentication](https://firebase.google.com/docs/auth)
- [Admin SDK](https://firebase.google.com/docs/admin/setup)

### 関連Issue・PR

- なし（初期実装）

---

## 変更履歴

| 日付       | 変更者 | 内容                                   |
| ---------- | ------ | -------------------------------------- |
| 2025-10-06 | ray    | 初版作成                               |
| 2025-10-06 | ray    | Stripe価格ID問題を追記                 |
| 2025-10-06 | ray    | 有料記事システム実装完了を追記         |
| 2025-10-06 | ray    | 上司の確認なしで可能なタスクリスト追加 |
| 2025-10-06 | ray    | tobiratory-webへのAPI実装方針を明記    |

---

## 承認

- [ ] jonosuke - データベース設計承認
- [ ] Inuta - セキュリティレビュー承認
- [ ] ray - 実装完了確認

---

## 付録

### A. エラーメッセージ集

#### Error: No such price

```
StripeInvalidRequestError: No such price: 'price_xxx'
```

**原因**: 価格IDがStripeアカウントに存在しない
**解決**: Stripeダッシュボードで価格ID確認

#### Error: POST requests are not available

```
POST requests are not available in static endpoints
```

**原因**: `export const prerender = false` が未設定
**解決**: APIエンドポイントに追加

#### Error: Webhook signature verification failed

```
StripeSignatureVerificationError: No signatures found matching the expected signature
```

**原因**: Webhook署名が不正
**解決**: `STRIPE_WEBHOOK_SECRET` を確認

### B. よくある質問

**Q: テストモードと本番モードの違いは？**
A: テストモードでは実際の決済が発生しません。テストカードのみ使用可能です。本番モードでは実際のカード決済が発生します。

**Q: Webhookが届かない場合は？**
A: Stripeダッシュボード → Developers → Webhooks → ログで配信状況を確認してください。

**Q: 既存ユーザーのサブスクリプション管理は？**
A: Stripe Customer Portalを使用することで、ユーザー自身でプラン変更・解約が可能です。

---

**このドキュメントについて:**

- 最新版は常にGitHubリポジトリに保存
- 変更時は変更履歴セクションを更新
- 不明点はrayまで連絡

**連絡先**: rr2024.web3@gmail.com
