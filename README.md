# TOBIRACAST

<div align="center">

![TOBIRACAST](https://img.shields.io/badge/TOBIRACAST-Tobiratory%E5%85%AC%E5%BC%8F-1779DE?style=for-the-badge)
[![License](https://img.shields.io/github/license/tobira-project/astro-notion-blog?style=for-the-badge)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://notion.so)

**Tobiratory公式ポータルサイト - Notion駆動の高速ブログプラットフォーム**

[デモを見る](#) | [ドキュメント](UPSTREAM_SYNC.md) | [問題を報告](https://github.com/tobira-project/astro-notion-blog/issues)

</div>

---

## 🎯 概要

TOBIRACASTは、[Tobiratory](https://tobiratory.com)の公式ポータルサイトです。Notionをコンテンツ管理システムとして使用し、Astroで静的サイト生成することで、超高速なページ表示を実現しています。

### ✨ 主な特徴

- 🚀 **圧倒的な高速表示** - 静的サイト生成による最適化されたパフォーマンス
- ✍️ **Notionで記事管理** - 使い慣れたNotionエディタで簡単コンテンツ作成
- 🎨 **カスタムデザイン** - TOBIRACAST独自のブランドカラーとレイアウト
- 🔐 **有料コンテンツ対応** - Firebase Auth + Stripe連携（実装予定）
- 📱 **完全レスポンシブ** - モバイルファーストデザイン
- 🔄 **自動同期なし** - 手動での選択的アップデート（カスタムデザイン保護）

---

## 🛠 技術スタック

| カテゴリ           | 技術                                |
| ------------------ | ----------------------------------- |
| **フレームワーク** | Astro 5.x                           |
| **CMS**            | Notion API (`@notionhq/client`)     |
| **認証**           | Firebase Auth（実装予定）           |
| **決済**           | Stripe（実装予定）                  |
| **スタイリング**   | CSS Variables + Astro Scoped Styles |
| **デプロイ**       | Cloudflare Pages / Vercel           |
| **画像処理**       | Sharp.js                            |

---

## 🚀 クイックスタート

### 必要環境

- **Node.js**: v20.18.1 以上
- **Notion**: ワークスペースとデータベース
- **Git**: バージョン管理

### セットアップ手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/tobira-project/astro-notion-blog.git
cd astro-notion-blog
```

2. **依存関係のインストール**

```bash
npm install
```

3. **環境変数の設定**

`.env.example` を `.env` にコピーして編集:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```env
NOTION_API_SECRET=your_notion_integration_token
DATABASE_ID=your_notion_database_id
```

4. **開発サーバーの起動**

```bash
npm run dev
```

ブラウザで http://localhost:4321 を開く

5. **ビルド（本番用）**

```bash
npm run build
npm run preview  # ビルド結果をプレビュー
```

---

## 📁 プロジェクト構成

```
astro-notion-blog/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   ├── layouts/            # レイアウトテンプレート
│   │   └── Layout.astro    # メインレイアウト（カスタムヘッダー/フッター）
│   ├── pages/              # ページルーティング
│   │   ├── index.astro     # ホームページ（最新6記事）
│   │   ├── posts/          # 記事ページ
│   │   ├── subscription.astro
│   │   └── login.astro
│   ├── styles/
│   │   └── tobiracast.css  # カスタムブランドカラー
│   ├── lib/                # ユーティリティ・API
│   └── server-constants.ts # サイト設定
├── public/                 # 静的ファイル
├── scripts/                # ビルドスクリプト
├── .github/                # GitHub設定
└── UPSTREAM_SYNC.md        # 上流同期ガイド
```

---

## 🎨 デザインシステム

### ブランドカラー

TOBIRACASTは独自のカラーシステムを使用しています（`src/styles/tobiracast.css`）:

```css
--tobiracast-primary-blue: #1779de; /* メインブルー */
--tobiracast-primary-orange: #e96800; /* メインオレンジ */
--tobiracast-light-blue: #4d94ff; /* ライトブルー */
--tobiracast-light-orange: #ff9a4d; /* ライトオレンジ */
```

### カスタマイズ対象外ファイル

**⚠️ 以下のファイルは上流から取り込まないでください:**

- `src/styles/tobiracast.css` - カスタムカラーシステム
- `src/layouts/Layout.astro` - カスタムヘッダー/フッター
- `src/pages/index.astro` - カスタムホームページ
- `src/components/ReadMoreLink.astro` - カスタムボタン
- `src/server-constants.ts` - サイトタイトル/説明文

---

## 🔄 上流リポジトリとの同期

このプロジェクトは [otoyo/astro-notion-blog](https://github.com/otoyo/astro-notion-blog) をフォークしていますが、**自動同期は無効化**されています。

### なぜ自動同期を無効化？

GitHub Pull アプリの `hardreset` 設定により、カスタムデザインが上書きされる問題が発生しました。そのため、手動での選択的マージに変更しています。

### 上流の変更を取り込む方法

詳細は **[UPSTREAM_SYNC.md](UPSTREAM_SYNC.md)** を参照してください。

**基本手順:**

```bash
# 1. 上流の最新情報を取得
git fetch upstream

# 2. 変更を確認
git log HEAD..upstream/main --oneline

# 3. 必要な変更だけ取り込む
git cherry-pick <commit-hash>

# または特定ファイルだけ
git checkout upstream/main -- src/lib/notion/client.ts
git commit -m "feat: Notion APIの改善を取り込む"
```

---

## 📝 開発コマンド

| コマンド               | 説明                                      |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | 開発サーバー起動（http://localhost:4321） |
| `npm run build`        | 本番ビルド                                |
| `npm run build:cached` | キャッシュ利用ビルド（Notion再取得）      |
| `npm run preview`      | ビルド結果をプレビュー                    |
| `npm run lint`         | コード品質チェック                        |
| `npm run format`       | コードフォーマット                        |
| `npm run cache:fetch`  | Notionコンテンツをキャッシュ              |
| `npm run cache:purge`  | キャッシュクリア                          |

---

## 🔐 環境変数

### 必須

```env
NOTION_API_SECRET=secret_xxxxxxxxxxxxxx    # Notion Integration Token
DATABASE_ID=xxxxxxxxxxxxxxxxxxxxx          # Notion Database ID
```

### オプション

```env
CUSTOM_DOMAIN=tobiracast.com               # カスタムドメイン
BASE_PATH=/                                # サブディレクトリパス
PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX         # Google Analytics
ENABLE_LIGHTBOX=true                       # 画像ライトボックス
REQUEST_TIMEOUT_MS=10000                   # APIタイムアウト
NODE_VERSION=20.18.1                       # Node.jsバージョン
```

### 今後実装予定

```env
# Firebase Auth
FIREBASE_PROJECT_ID=your-project
FIREBASE_API_KEY=your-api-key

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🚀 デプロイ

### Cloudflare Pages（推奨）

1. Cloudflare Pagesにログイン
2. "Create a project" → "Connect to Git"
3. このリポジトリを選択
4. ビルド設定:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `NOTION_API_SECRET`, `DATABASE_ID`, `NODE_VERSION`

### Vercel

1. Vercelにリポジトリをインポート
2. 環境変数を設定
3. デプロイ

---

## 🗺️ ロードマップ

### Phase 1: デザイン・基盤 ✅

- [x] TOBIRACASTブランディング
- [x] カスタムヘッダー/フッター
- [x] レスポンシブデザイン
- [x] ハンバーガーメニュー
- [x] 記事一覧ページ
- [x] 上流同期ガイド作成

### Phase 2: 有料コンテンツ（進行中）

- [ ] Notion DBスキーマ拡張（`IsPremium`, `PremiumContent`）
- [ ] 記事詳細ページにペイウォール実装
- [ ] Firebase Auth統合
- [ ] Stripe決済統合
- [ ] サブスクリプション管理

### Phase 3: 高度な機能

- [ ] トークン配布システム
- [ ] カスタム動画ホスティング
- [ ] 分析ダッシュボード
- [ ] メンバー限定機能

---

## 🤝 コントリビューション

このプロジェクトはTobiratoryの内部プロジェクトです。

### 開発メンバー

- **Ray**: プライマリ開発者
- **tererun**: フルスタック開発者、Blockchain専門
- **jonosuke**: テクニカルアドバイザー
- **Inuta**: プロダクトオーナー、コンテンツクリエイター

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

---

## 🙏 謝辞

このプロジェクトは [otoyo/astro-notion-blog](https://github.com/otoyo/astro-notion-blog) をベースにしています。

元のプロジェクトの作者に感謝します 🙏

---

## 📞 サポート

問題が発生した場合:

1. [Issues](https://github.com/tobira-project/astro-notion-blog/issues) で報告
2. [UPSTREAM_SYNC.md](UPSTREAM_SYNC.md) を確認
3. チームメンバーに相談

---

<div align="center">

**Built with ❤️ by [Tobiratory](https://tobiratory.com)**

[Website](https://tobiratory.com) • [Twitter](https://twitter.com/tobiratory)

</div>
