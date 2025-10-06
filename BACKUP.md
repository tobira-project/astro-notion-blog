# バックアップ情報

## Tailwind導入前のバックアップ

**作成日時:** 2025-10-06
**理由:** Tailwind CSS導入前の状態を保存

### 保存場所

#### 1. Gitタグ
```
タグ名: pre-tailwind-migration
コミット: a64d28a (docs: PUBLIC_API_URLに説明コメントを追加)
```

#### 2. Gitブランチ
```
ブランチ名: backup-before-tailwind
リモート: origin/backup-before-tailwind
```

### バックアップに戻す方法

#### タグから復元
```bash
git checkout pre-tailwind-migration
```

#### ブランチから復元
```bash
git checkout backup-before-tailwind
```

#### mainブランチに戻す（Tailwind導入後の状態）
```bash
git checkout main
```

### GitHub上での確認

- **タグ:** https://github.com/tobira-project/astro-notion-blog/releases/tag/pre-tailwind-migration
- **ブランチ:** https://github.com/tobira-project/astro-notion-blog/tree/backup-before-tailwind

### 現在の状態

**Tailwind導入前:**
- Layout.astro: 945行（カスタムCSS）
- CSS変数: tobiracast.css（120行以上）
- ページ: index, login, subscription, mypage
- 認証: Firebase + Stripe統合済み

---

## その他のバックアップ履歴

（今後のバックアップをここに追記）
