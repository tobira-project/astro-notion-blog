# 上流リポジトリとの手動同期ガイド

このドキュメントは、otoyo/astro-notion-blog から TOBIRACAST のカスタムデザインを維持しながら、必要な変更を取り込む手順を説明します。

## ⚠️ 重要な注意事項

- **絶対に `git merge upstream/main` や `git pull upstream main` を実行しないでください**
- これらのコマンドはカスタムデザインを上書きする可能性があります
- 常に選択的に必要な変更のみを取り込みます

---

## 🔧 初期設定（初回のみ）

上流リポジトリがまだ追加されていない場合:

```bash
git remote add upstream https://github.com/otoyo/astro-notion-blog.git
git fetch upstream
```

確認:

```bash
git remote -v
# origin    https://github.com/tobira-project/astro-notion-blog (fetch)
# origin    https://github.com/tobira-project/astro-notion-blog (push)
# upstream  https://github.com/otoyo/astro-notion-blog.git (fetch)
# upstream  https://github.com/otoyo/astro-notion-blog.git (push)
```

---

## 📥 上流の変更を確認する手順

### 1. 最新の変更を取得

```bash
git fetch upstream
```

### 2. 差分を確認

```bash
# 変更されたファイルの一覧を表示
git log HEAD..upstream/main --oneline

# 詳細な差分を確認
git log HEAD..upstream/main --stat

# 特定のファイルの差分を確認
git diff HEAD..upstream/main -- src/lib/notion/client.ts
```

### 3. 変更内容を精査

以下の項目をチェック:

- ✅ **バグ修正**: 取り込むべき
- ✅ **新機能（Notion API関連）**: 取り込むべき
- ✅ **パフォーマンス改善**: 取り込むべき
- ❌ **デザイン変更**: 取り込まない
- ❌ **Layout/CSS変更**: 取り込まない

---

## 🎯 必要な変更だけを取り込む方法

### 方法1: 特定のコミットを取り込む（推奨）

```bash
# 取り込みたいコミットのハッシュを確認
git log upstream/main --oneline -20

# 特定のコミットを取り込む
git cherry-pick <コミットハッシュ>

# 複数のコミットを取り込む
git cherry-pick <hash1> <hash2> <hash3>

# コンフリクトが発生した場合
# 1. 手動でファイルを編集
# 2. git add <ファイル名>
# 3. git cherry-pick --continue
```

### 方法2: 特定のファイルだけを取り込む

```bash
# 特定のファイルの変更を取り込む
git checkout upstream/main -- src/lib/notion/client.ts

# 変更を確認
git diff --staged

# 問題なければコミット
git commit -m "feat: Notion API client の改善を上流から取り込む"
```

### 方法3: パッチを適用する

```bash
# パッチファイルを作成
git diff HEAD..upstream/main -- src/lib/notion/client.ts > /tmp/upstream.patch

# パッチの内容を確認
cat /tmp/upstream.patch

# パッチを適用
git apply /tmp/upstream.patch

# コミット
git add src/lib/notion/client.ts
git commit -m "feat: Notion API client の改善を上流から取り込む"
```

---

## 🛡️ カスタムデザインを守るために

### 絶対に上流から取り込んではいけないファイル:

```bash
src/styles/tobiracast.css         # カスタムカラーシステム
src/layouts/Layout.astro           # カスタムヘッダー・フッター
src/pages/index.astro              # カスタムホームページ
src/components/ReadMoreLink.astro  # カスタムボタン
src/server-constants.ts            # SITE_TITLE/DESCRIPTION
```

### 取り込んでも良いファイル（通常）:

```bash
src/lib/notion/client.ts           # Notion API クライアント
src/lib/notion/interfaces.ts       # 型定義
src/lib/blog-helpers.ts            # ヘルパー関数
package.json                       # 依存関係（慎重に）
```

---

## 📋 定期的な同期チェックリスト

### 月1回程度の確認推奨:

1. ✅ 上流の変更を取得: `git fetch upstream`
2. ✅ 変更内容を確認: `git log HEAD..upstream/main --stat`
3. ✅ 必要な変更を選択
4. ✅ cherry-pick または個別ファイル取り込み
5. ✅ ローカルで動作確認: `npm run dev`
6. ✅ ビルドテスト: `npm run build`
7. ✅ コミット & プッシュ

---

## 🚨 トラブルシューティング

### コンフリクトが発生した場合

```bash
# cherry-pick中のコンフリクト
git status  # コンフリクトファイルを確認

# ファイルを手動編集（<<<<<<< や ======= を削除）

git add <解決したファイル>
git cherry-pick --continue

# 中止したい場合
git cherry-pick --abort
```

### 誤って上流の変更を全部マージしてしまった場合

```bash
# 最新のコミットを取り消す
git reset --hard HEAD~1

# カスタムデザインを復元
git checkout 726f247 -- src/styles/tobiracast.css
git checkout 726f247 -- src/layouts/Layout.astro
git checkout 726f247 -- src/pages/index.astro
git checkout 726f247 -- src/components/ReadMoreLink.astro
git checkout 726f247 -- src/server-constants.ts
```

---

## 📝 良い例・悪い例

### ❌ 悪い例（やってはいけない）

```bash
# 全部マージ（カスタムデザインが消える）
git merge upstream/main

# 全部プル（カスタムデザインが消える）
git pull upstream main

# pull.yml を復活させる（自動マージが再開される）
git checkout upstream/main -- .github/pull.yml
```

### ✅ 良い例

```bash
# 特定のバグ修正だけ取り込む
git cherry-pick abc123f

# Notion API の改善だけ取り込む
git checkout upstream/main -- src/lib/notion/client.ts
git commit -m "feat: Notion API クライアントの改善を取り込む"

# 変更を確認してから慎重に取り込む
git log upstream/main --oneline -10
git show abc123f  # 内容を確認
git cherry-pick abc123f
```

---

## 🔍 参考コマンド集

```bash
# 上流の最新情報を取得
git fetch upstream

# 上流との差分を確認
git log HEAD..upstream/main
git diff HEAD..upstream/main

# 特定ファイルの差分
git diff HEAD..upstream/main -- path/to/file

# コミット履歴をグラフで表示
git log --graph --oneline --all -20

# 上流の特定タグをチェックアウト
git checkout upstream/0.10.1

# 現在の状態を確認
git status
git remote -v
git log --oneline -5
```

---

## 📞 困ったときは

1. Claude Code に相談する
2. チームメンバー（tererun, jonosuke）に相談
3. このドキュメントの手順を再確認

---

**最終更新**: 2025-10-05
**管理者**: Ray
**重要度**: 🔴 HIGH - カスタムデザイン保護のため必須
