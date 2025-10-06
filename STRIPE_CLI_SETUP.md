# Stripe CLI セットアップガイド

ローカル開発環境でStripe Webhookをテストするための手順書

## 概要

Stripe CLIを使用すると、ローカル開発環境でStripe Webhookイベントを受信してテストできます。
これにより、本番環境にデプロイする前にサブスクリプション機能の動作を確認できます。

## 前提条件

- macOS、Linux、またはWindows
- Stripeアカウント（テストモード）
- 開発サーバーが起動していること

## 1. Stripe CLIのインストール

### macOS (Homebrew)

```bash
brew install stripe/stripe-cli/stripe
```

### macOS (手動インストール)

```bash
# ダウンロード
curl -L https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_darwin_arm64.tar.gz -o stripe.tar.gz

# 解凍
tar -xvf stripe.tar.gz

# /usr/local/binに移動
sudo mv stripe /usr/local/bin/

# 実行権限を付与
sudo chmod +x /usr/local/bin/stripe
```

### Linux

```bash
# ダウンロード
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz

# 解凍
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz

# /usr/local/binに移動
sudo mv stripe /usr/local/bin/

# 実行権限を付与
sudo chmod +x /usr/local/bin/stripe
```

### Windows

PowerShellで実行:

```powershell
scoop install stripe
```

または、[GitHubリリースページ](https://github.com/stripe/stripe-cli/releases)から直接ダウンロード

### インストール確認

```bash
stripe --version
```

`stripe version X.X.X` のように表示されればインストール成功です。

## 2. Stripe CLIのログイン

### テストモードでログイン

```bash
stripe login
```

1. コマンドを実行すると、ブラウザが開きます
2. Stripeダッシュボードにログイン
3. 「Allow access」をクリック
4. ターミナルに戻り、接続成功メッセージを確認

### ログイン確認

```bash
stripe config --list
```

テストモードのAPIキーが表示されればOKです。

## 3. Webhookイベントのリスニング

### 基本的な使い方

開発サーバーが起動している状態で、別のターミナルウィンドウを開き:

```bash
stripe listen --forward-to localhost:4321/api/stripe-webhook
```

**注意:** `/api/stripe-webhook` エンドポイントは今後実装予定です。

### Webhook Signing Secretの取得

`stripe listen` を実行すると、以下のようなメッセージが表示されます:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

この `whsec_xxxxxxxxxxxxx` をコピーして、`.env` ファイルに追加:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### イベントフィルタリング

特定のイベントのみをリスニングする場合:

```bash
stripe listen \
  --forward-to localhost:4321/api/stripe-webhook \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted
```

監視するイベント:

- `checkout.session.completed` - 決済完了
- `customer.subscription.updated` - サブスクリプション更新
- `customer.subscription.deleted` - サブスクリプション解約
- `invoice.payment_succeeded` - 請求成功
- `invoice.payment_failed` - 請求失敗

## 4. Webhookイベントのテスト

### イベントのトリガー

別のターミナルウィンドウで:

```bash
# Checkout Session完了イベントを送信
stripe trigger checkout.session.completed

# サブスクリプション更新イベントを送信
stripe trigger customer.subscription.updated

# サブスクリプション削除イベントを送信
stripe trigger customer.subscription.deleted
```

### カスタムイベントの送信

```bash
# 特定のCheckout SessionのIDを使用
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.firebaseUid=test-user-123 \
  --add checkout_session:customer_email=test@example.com
```

## 5. ログの確認

### リアルタイムログ

```bash
stripe listen --print-json
```

これにより、受信したWebhookイベントの詳細がJSON形式で表示されます。

### イベント履歴の確認

```bash
# 最近のイベントを一覧表示
stripe events list --limit 10

# 特定のイベントの詳細を表示
stripe events retrieve evt_xxxxxxxxxxxxx
```

## 6. 開発ワークフロー

### 推奨される開発フロー

1. **ターミナル1: 開発サーバー**

   ```bash
   npm run dev
   ```

2. **ターミナル2: Stripe Webhook リスニング**

   ```bash
   stripe listen --forward-to localhost:4321/api/stripe-webhook
   ```

3. **ターミナル3: イベントトリガー（必要に応じて）**
   ```bash
   stripe trigger checkout.session.completed
   ```

### デバッグのヒント

1. **Webhookが受信されない場合**
   - 開発サーバーが起動しているか確認
   - ポート番号が正しいか確認（デフォルト: 4321）
   - ファイアウォール設定を確認

2. **署名検証エラーが発生する場合**
   - `.env` の `STRIPE_WEBHOOK_SECRET` が正しいか確認
   - `stripe listen` で表示されたsecretを使用しているか確認

3. **イベントが処理されない場合**
   - Webhook エンドポイント (`/api/stripe-webhook`) が実装されているか確認
   - サーバーログでエラーを確認

## 7. 本番環境への移行

### 本番環境のWebhook設定

1. Stripeダッシュボードにログイン
2. **Developers** > **Webhooks** に移動
3. **Add endpoint** をクリック
4. エンドポイントURLを入力: `https://your-domain.com/api/stripe-webhook`
5. 監視するイベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. **Add endpoint** をクリック
7. Webhook signing secret をコピー
8. 本番環境の環境変数に設定

### 環境変数の設定

**開発環境 (.env.local)**

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # stripe listen で取得
```

**本番環境 (.env.production または Cloudflare Pages設定)**

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # ダッシュボードで取得
```

## 8. トラブルシューティング

### 問題: stripe コマンドが見つからない

**解決策:**

```bash
# PATHを確認
echo $PATH

# Stripeのパスを追加
export PATH="/usr/local/bin:$PATH"

# .zshrc または .bashrc に追加
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 問題: ログインできない

**解決策:**

1. ブラウザのキャッシュをクリア
2. 別のブラウザで試す
3. Stripeダッシュボードに直接アクセスして認証状態を確認

### 問題: Webhookイベントが重複する

**解決策:**

- `stripe listen` が複数実行されていないか確認
- 既存のプロセスを終了: `Ctrl + C`
- 再度 `stripe listen` を実行

### 問題: ポート4321が使用中

**解決策:**

```bash
# 使用中のプロセスを確認
lsof -i :4321

# プロセスを終了
kill -9 <PID>

# または、別のポートで起動
npm run dev -- --port 3000
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## 9. 便利なコマンド集

### イベント一覧

```bash
# サポートされているイベント一覧を表示
stripe trigger --help

# 特定のリソースのイベントを表示
stripe trigger --list | grep subscription
```

### 顧客情報の確認

```bash
# 顧客一覧
stripe customers list --limit 5

# 特定の顧客の詳細
stripe customers retrieve cus_xxxxxxxxxxxxx
```

### サブスクリプション情報の確認

```bash
# サブスクリプション一覧
stripe subscriptions list --limit 5

# 特定のサブスクリプションの詳細
stripe subscriptions retrieve sub_xxxxxxxxxxxxx
```

### 価格情報の確認

```bash
# 価格一覧
stripe prices list

# 特定の価格の詳細
stripe prices retrieve price_xxxxxxxxxxxxx
```

### テストデータのクリア

```bash
# テストモードのデータを削除（注意: 元に戻せません）
stripe resources delete cus_xxxxxxxxxxxxx
stripe resources delete sub_xxxxxxxxxxxxx
```

## 10. セキュリティのベストプラクティス

1. **Webhook署名の検証を必ず実装する**

   ```typescript
   const signature = request.headers.get('stripe-signature');
   const event = stripe.webhooks.constructEvent(
     body,
     signature,
     process.env.STRIPE_WEBHOOK_SECRET
   );
   ```

2. **本番環境とテスト環境のKeyを混同しない**
   - テストキー: `sk_test_`, `pk_test_`
   - 本番キー: `sk_live_`, `pk_live_`

3. **Webhook Secretを環境変数で管理する**
   - コードにハードコードしない
   - GitHubにコミットしない

4. **IDの検証を行う**
   - Webhook経由で受け取ったデータを信頼する前に検証
   - ユーザーIDやメールアドレスを確認

## 11. 参考リンク

- [Stripe CLI公式ドキュメント](https://stripe.com/docs/stripe-cli)
- [Webhookテストガイド](https://stripe.com/docs/webhooks/test)
- [Stripe API リファレンス](https://stripe.com/docs/api)
- [GitHub: Stripe CLI](https://github.com/stripe/stripe-cli)

## 次のステップ

1. Stripe CLIをインストールして動作確認
2. `stripe listen` でWebhookイベントをリスニング
3. `/api/stripe-webhook` エンドポイントを実装（tobiratory-web）
4. Webhook署名検証を実装
5. サブスクリプション状態をDBに保存する処理を実装
6. 本番環境にWebhookエンドポイントを登録

## 注意事項

- **現在、`/api/stripe-webhook` エンドポイントは未実装です**
- エンドポイント実装後に本ガイドに従ってテストしてください
- 実装は tobiratory-web リポジトリで行う予定です
