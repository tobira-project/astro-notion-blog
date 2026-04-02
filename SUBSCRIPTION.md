# TOBIRACAST サブスクリプション機能メモ

最終更新: 2026-04-02
対象リポジトリ: `astro-notion-blog`

## 概要

`astro-notion-blog` 側のサブスクリプション実装は、フロントエンドとして必要な主要機能まで完了しています。
現在のボトルネックは `tobiratory-web` 側の DB / Stripe Webhook / Portal API です。

現状の到達点:

- ログイン / 新規登録フローあり
- プラン選択ページあり
- Stripe Checkout 遷移あり
- 成功 / キャンセルページあり
- マイページ UI あり
- 有料記事の表示ゲートあり
- `blog-subscriptionStatus` API の呼び出しあり
- `BASE_PATH` 対応済み

現状の未接続部分:

- 決済結果を保持する `blog_accounts` テーブル
- Stripe Webhook から DB への書き込み
- マイページの表示内容を正しく返すバックエンド
- カスタマーポータル連携

## astro-notion-blog 側で完了済みの項目

### 1. 認証導線

- [src/pages/login.astro](/Users/ray/dev/astro-notion-blog/src/pages/login.astro)
- Google / Apple / メールでのログイン / 新規登録 UI を実装
- アカウントセットアップ中の表示とリトライ導線あり

### 2. プラン選択と Stripe Checkout 導線

- [src/pages/subscription.astro](/Users/ray/dev/astro-notion-blog/src/pages/subscription.astro)
- ベーシック / スタンダード / プレミアムの 3 プラン UI を実装
- ログイン済みユーザーのみ決済へ進む前提のフローを実装
- Stripe Checkout へ遷移するフロント処理を実装

### 3. 決済後画面

- [src/pages/success.astro](/Users/ray/dev/astro-notion-blog/src/pages/success.astro)
- [src/pages/cancel.astro](/Users/ray/dev/astro-notion-blog/src/pages/cancel.astro)
- 決済成功 / キャンセル後の遷移先 UI を実装

### 4. マイページ UI

- [src/pages/mypage.astro](/Users/ray/dev/astro-notion-blog/src/pages/mypage.astro)
- ログイン判定、プロフィール表示、ログアウト導線を実装
- アカウント確認と購読状態取得を並列で実行
- `blog-subscriptionStatus` API を呼び出して以下を表示する構造を実装
- 現在のプラン
- サブスクリプション状態
- 次回更新日

補足:

- いま「未加入」のまま見える原因は UI 側ではなく、参照先の `blog_accounts` にレコードが存在しないため

### 5. 有料記事の保護

- [src/lib/premium-content.ts](/Users/ray/dev/astro-notion-blog/src/lib/premium-content.ts)
- [src/components/PremiumContentGate.astro](/Users/ray/dev/astro-notion-blog/src/components/PremiumContentGate.astro)
- [src/pages/posts/[slug].astro](/Users/ray/dev/astro-notion-blog/src/pages/posts/[slug].astro)

実装内容:

- Notion の最初の `Divider` を無料 / 有料の境界として扱う
- `premiumBlocks` を `<template>` 内に保持し、認証後にクライアント側で挿入する
- 未加入ユーザーにはペイウォール UI のみを表示
- `ACTIVE` に加えて `TRIALING` も閲覧可能な購読状態として扱う

補足:

- 表示上は未加入ユーザーに有料本文を見せない構成
- ただし現状の実装では `premiumBlocks` が配信 HTML 内の `<template>` に残るため、「静的 HTML に含めない」という以前の説明とは一致しない
- ソースレベルで本文を配信しないことまで要件に含めるなら、実装の再見直しが必要

### 6. API 呼び出しラッパー

- [src/lib/subscription-client.ts](/Users/ray/dev/astro-notion-blog/src/lib/subscription-client.ts)
- `blog-subscriptionStatus` のレスポンス型と表示用フォーマッタを実装
- `hasActiveSubscription` または `subscription_status in ['ACTIVE', 'TRIALING']` を購読中として扱うヘルパーを実装

### 7. ベースパス / ビルド耐障害性対応

- [astro.config.mjs](/Users/ray/dev/astro-notion-blog/astro.config.mjs)
- [src/lib/blog-helpers.ts](/Users/ray/dev/astro-notion-blog/src/lib/blog-helpers.ts)
- [src/lib/public-path.ts](/Users/ray/dev/astro-notion-blog/src/lib/public-path.ts)

実装内容:

- `BASE_PATH` 前提で各画面遷移が動くよう調整
- static build 前提で壊れにくい URL 解決へ修正

## 現在の問題

Stripe のテスト決済自体は通るが、マイページでは未加入のまま表示されるケースがある。

現在の API レスポンス:

```json
{
  "hasActiveSubscription": false,
  "subscription_status": null,
  "subscription_tier": null,
  "current_period_end": null,
  "cancel_at_period_end": false
}
```

原因:

- `blog-subscriptionStatus` API は `blog_accounts` テーブルを参照している
- しかし決済完了後に DB へ書き込む処理が未接続
- そのため Checkout 完了後も購読状態が保存されない

加えて、ドキュメント上の注意点:

- フロントエンドは `ACTIVE` / `TRIALING` を購読可能状態として扱うようになった
- 有料本文の扱いは「静的 HTML から完全に除外」ではなく「クライアント描画前は非表示テンプレートに保持」という状態

## tobiratory-web 側の残タスク

### 必須

1. `blog_accounts` テーブルの作成
2. Prisma マイグレーション実行
3. Stripe Webhook から `blog_accounts` への upsert / update
4. `blog-subscriptionStatus` が DB の最新状態を返すようにする

必要カラム:

- `account_uuid`
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status`
- `subscription_tier`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`

処理したい Stripe イベント:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### あると次に進めやすいもの

- Customer Portal Session 作成 API
- `POST /blog/create-portal-session`

これができると、マイページからプラン変更 / 解約ボタンを実装できる。

## バックエンド完了後の確認項目

### E2E 確認

1. テストカードで決済
2. `blog_accounts` にレコード作成されることを確認
3. マイページでプラン / 状態 / 次回更新日が反映されることを確認
4. 有料記事で無料部分のみ公開されていることを確認
5. `ACTIVE` または `TRIALING` のユーザーで有料部分が閲覧できることを確認
6. ソース表示や Elements で有料本文が露出していないことを、要件次第で別途確認

### 追加実装

- マイページに「プラン変更」「解約」ボタンを追加
- Portal Session API に接続

## バックエンド待ちの間に進められること

### 1. Notion にテスト用の有料記事を作る

- 検証用の記事を 1 本以上用意しておく
- 無料部分と有料部分の境界に `Divider` を 1 つ入れる
- バックエンド接続後すぐに E2E を回せる状態にしておく

### 2. テスト観点を先に固める

- 未ログイン時の見え方
- ログイン済み未加入時の見え方
- 加入済み時の見え方
- 決済成功 / キャンセル導線
- マイページ反映

### 3. バックエンド担当への依頼内容を固定化する

依頼の要点:

- `blog_accounts` 作成
- Prisma migration
- Stripe Webhook で DB 更新
- `blog-subscriptionStatus` の正答化
- 可能なら Customer Portal API

## 備考

- `npm run build` は実行環境の Notion / 環境変数設定に依存する
- このリポジトリ単体で決済完了後の加入状態までは完結しない
- サブスクリプションの真実の状態は `tobiratory-web` 側 DB を正とする前提
