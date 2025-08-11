# TOBIRACAST ログイン機能実装 TODO

## 📋 現在の状況

### プロジェクト概要

- **プロジェクト名**: TOBIRACAST (astro-notion-blog)
- **要件**: Tobiratoryアカウントのログイン機能を実装
- **参考コード**: tobiratory-webプロジェクト（既存のログインシステム）

### 環境・技術スタック

- **フレームワーク**: Astro + Notion API
- **認証**: Firebase Authentication（実装予定）
- **バックエンド**: Cloud Functions（Tobiratory既存API）
- **ブロックチェーン**: Flow（Flowアカウント連携）

## 🎯 実装すべき機能

### 1. Firebase Authentication統合

- [ ] Firebase SDKのインストールと設定
- [ ] Firebase設定ファイルの作成（firebase.config.ts）
- [ ] 環境変数の設定
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - その他Firebase関連の設定

### 2. 認証フロー実装

#### 2.1 サインイン/サインアップ

- [ ] ログインページの作成（/login）
- [ ] サインイン処理の実装
  - Google認証
  - Apple認証
  - メール認証
- [ ] Firebase認証成功後の処理

#### 2.2 アカウント作成フロー

```
1. Firebase Auth でサインイン
   ↓
2. プロフィール確認 (fetch `/native/my/profile`)
   ↓
3. レスポンスに応じた処理:
   - success → ログイン完了
   - account-not-exists → Tobiratoryアカウント作成
   - flow-account-not-exists → Flowアカウント作成
   - flow-address-creating → 作成待機
   - flow-account-retrying → 再作成待機
   - flow-account-create-error → 再作成処理
```

### 3. Tobiratoryアカウント作成

- [ ] アカウント作成API呼び出し実装
  ```typescript
  fetch(`${API_URL}/native/signup`);
  ```
- [ ] エラーハンドリング
- [ ] 作成成功後の処理

### 4. Flowアカウント作成

- [ ] Flowアカウント作成API呼び出し
  ```typescript
  fetch(`${API_URL}/native/create-flow`);
  ```
- [ ] 作成状態の定期確認（10秒間隔）
  ```typescript
  const waitFlowAccountCreation = async () => {
    // 10秒ごとにプロフィール確認
    fetch(`${API_URL}/native/my/profile`);
  };
  ```
- [ ] ブラウザを閉じても継続できる仕組み
  - LocalStorageまたはSessionStorageの活用
  - 状態の永続化

### 5. ユーザー状態管理

- [ ] 認証状態の管理（Context API or Zustand）
- [ ] ユーザー情報の保存
- [ ] ログアウト処理
- [ ] セッション管理

### 6. UI/UXコンポーネント

- [ ] ログインフォーム
- [ ] ローディング表示
- [ ] エラーメッセージ表示
- [ ] アカウント作成中の進捗表示
- [ ] ログイン後のユーザー表示（ヘッダー）

## 📁 参考ファイル（tobiratory-web）

### 重要なファイル

1. **認証関連**
   - `/packages/fetchers/firebase/client.ts` - Firebase設定
   - `/apps/admin/src/pages/authentication.tsx` - 管理画面ログイン
   - `/apps/journal/pages/login.tsx` - Journalアプリログイン

2. **API呼び出し**
   - `/packages/fetchers/adminUserAccount.ts` - アカウント作成API

3. **型定義**
   - `/packages/types/adminTypes.ts` - 型定義

## 🔧 API仕様

### エンドポイント

- **開発環境API_URL**: `https://asia-northeast1-tobiratory-f6ae1.cloudfunctions.net`

### APIレスポンス型

```typescript
interface ProfileResponse {
  status: 'success' | 'error';
  data: AccountInfo | ErrorType;
}

type ErrorType =
  | 'account-not-exists'
  | 'flow-account-not-exists'
  | 'flow-address-creating'
  | 'flow-account-retrying'
  | 'flow-account-create-error';
```

## 📅 実装順序（推奨）

1. **Phase 1: 基盤構築**（1-2日）
   - Firebase設定
   - 環境変数設定
   - 基本的な認証フロー

2. **Phase 2: アカウント連携**（2-3日）
   - Tobiratoryアカウント作成
   - プロフィール取得
   - エラーハンドリング

3. **Phase 3: Flowアカウント**（2-3日）
   - Flowアカウント作成
   - 非同期処理の実装
   - 状態管理

4. **Phase 4: UI/UX改善**（1-2日）
   - ローディング表示
   - エラー表示
   - ユーザビリティ向上

## ⚠️ 注意事項

1. **Flowアカウント作成の順序**
   - 必ずTobiratoryアカウントを先に作成
   - Flowアカウントは非同期で作成（時間がかかる）

2. **エラーハンドリング**
   - ネットワークエラー
   - API制限
   - タイムアウト処理

3. **セキュリティ**
   - APIキーの管理
   - 認証トークンの安全な保存
   - CORS設定

## 🔗 関連リンク

- [Tobiratory MVP仕様書](https://www.notion.so/Tobiratory-MVP-specification-9bfc146a259a42f48260ddcaddd29c8c)
- Firebase Auth ドキュメント
- Flow Blockchain ドキュメント

## 📝 メモ

- jonosukeさんからの指示：サインイン/サインアップの処理フローに注意
- Firebase Authでは自動的にアカウントが作成される（専用のサインアップ処理は不要）
- Flowアカウント作成は時間がかかるため、UXを考慮した実装が必要
