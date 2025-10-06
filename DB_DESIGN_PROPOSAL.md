# ブログサブスクリプション機能のDB設計提案

## 現状報告

### 実装済み

- 認証システム（Firebase Auth + Tobiratory Account + Flow Account）
- サブスクリプションページのUI（3段階プラン表示）
- Stripeとの連携準備（環境変数は設定済み）

### 未実装

- blog_accountsテーブル
- Stripe関連テーブル（サブスクリプション管理）
- バックエンドAPI（Checkout Session作成、Webhook処理）

---

## 提案するテーブル設計

### 1. blog_accounts テーブル

```prisma
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
```

### 2. accounts テーブルへのリレーション追加

```prisma
model accounts {
  // ... 既存のフィールド ...
  blog_account          blog_accounts?
}
```

---

## 設計のポイント

### account_uuid を nullable にする理由

以前ご指示いただいた「accountsテーブルのレコードが削除された際、blog_accountsも削除するのではなく、accountsが紐づいていない場合は無効とする」という方針に従い、account_uuidをnullableにしています。

### サブスクリプション状態の管理

- Stripe Webhookから送られる情報をsubscription_statusで管理
- subscription_tierで契約プラン（basic/standard/premium）を判別
- 有料記事へのアクセスはsubscription_status === 'active'で判定

---

## 質問事項

### 1. マイグレーション実行について

schema.prismaへの追加とマイグレーション実行をそちら側で行っていただけますでしょうか。

### 2. 追加テーブルの必要性について

現在は最小構成としていますが、以下の機能が必要な場合は追加テーブルが必要です。

- 決済履歴の保存
- プラン変更履歴
- トライアル期間の管理

### 3. Stripeのテストモードについて

開発時はStripeのテストモードを使用し、本番デプロイ時に本番モードへ切り替える想定ですが問題ないでしょうか。

---

## 次のステップ

1. DB設計の承認
2. マイグレーション実行
3. バックエンドAPI実装（/create-checkout-session、Webhook処理）
4. フロントエンド統合（アクセス権限チェック、有料部分の非表示）

よろしくお願いいたします。
