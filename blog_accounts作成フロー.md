# blog_accounts作成フローの整理

## 🤔 現在の疑問点

**いつ、どのタイミングでblog_accountsレコードが作成されるのか？**

## 📊 考えられるパターン

### パターンA: 初回ログイン時に自動作成

```
1. ユーザーがFirebaseでログイン
2. Tobiratoryアカウント作成/取得
3. blog_accountsも同時に作成（無料会員として）
4. その後、Stripeで課金したらis_premium=trueに更新
```

**メリット**:

- 全ユーザーのブログ閲覧履歴を追跡可能
- 後から課金しやすい

**デメリット**:

- 無料ユーザーも含めて大量のレコードが作成される

### パターンB: 有料プラン契約時のみ作成

```
1. ユーザーがFirebaseでログイン（blog_accountsなし）
2. 無料記事は誰でも読める
3. 有料記事をクリック → 課金ページへ
4. Stripe決済完了時にblog_accounts作成
```

**メリット**:

- 必要最小限のレコードのみ
- DBが軽い

**デメリット**:

- 無料ユーザーの行動追跡不可

### パターンC: 初回ブログアクセス時に作成

```
1. ユーザーがブログページを開く
2. ログイン済みならblog_accounts確認
3. なければ作成（is_premium=false）
4. 課金したら更新
```

**メリット**:

- ブログを使うユーザーのみレコード作成
- 柔軟な管理

## 🎯 推奨案

**パターンB（有料プラン契約時のみ）が最もシンプル**

理由：

1. ブログ閲覧にアカウントは不要（無料部分）
2. 有料会員のみ管理すれば十分
3. テーブルがシンプルに保てる

## 📝 実装イメージ

### 無料ユーザーの場合

```typescript
// 有料記事チェック
const checkPremiumAccess = async (userId?: string) => {
  if (!userId) return false;

  // blog_accountsを検索
  const blogAccount = await getBlogAccount(userId);

  // レコードがない = 無料ユーザー
  if (!blogAccount) return false;

  // レコードがある & is_premium = true なら有料会員
  return blogAccount.is_premium;
};
```

### 課金時の処理

```typescript
// Stripe Webhook受信時
const handleStripeWebhook = async (event) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // blog_accounts作成または更新
    await upsertBlogAccount({
      account_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      is_premium: true,
      subscription_status: 'active',
    });
  }
};
```

## ❓ 上司への確認事項

1. **blog_accountsの作成タイミングは？**
   - A: 初回ログイン時（全員）
   - B: 有料プラン契約時のみ
   - C: 初回ブログアクセス時

2. **無料ユーザーの管理は必要？**
   - 必要 → パターンAまたはC
   - 不要 → パターンB

3. **将来的な機能拡張の予定は？**
   - 閲覧履歴
   - お気に入り機能
   - コメント機能
     → これらがあるならパターンA推奨
