# 🔥 Firebase設定が必要です

## 必要な環境変数

`.env`ファイルに以下のFirebase認証情報を設定する必要があります：

```env
# Firebase設定（tobiratory-f6ae1プロジェクト）
PUBLIC_FIREBASE_API_KEY=（上司から取得）
PUBLIC_FIREBASE_AUTH_DOMAIN=tobiratory-f6ae1.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tobiratory-f6ae1
PUBLIC_FIREBASE_STORAGE_BUCKET=tobiratory-f6ae1.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=（上司から取得）
PUBLIC_FIREBASE_APP_ID=（上司から取得）
PUBLIC_FIREBASE_MEASUREMENT_ID=（上司から取得）
```

## 取得が必要な値

上司/チームから以下の値を取得してください：

1. **PUBLIC_FIREBASE_API_KEY** - FirebaseプロジェクトのAPIキー
2. **PUBLIC_FIREBASE_MESSAGING_SENDER_ID** - メッセージング送信者ID
3. **PUBLIC_FIREBASE_APP_ID** - FirebaseアプリID
4. **PUBLIC_FIREBASE_MEASUREMENT_ID** - 測定ID（Analytics用）

## 取得方法

### 方法1: Firebase Consoleから直接取得
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. `tobiratory-f6ae1`プロジェクトを選択
3. プロジェクト設定 → 全般タブ
4. 「ウェブアプリ」セクションの設定値をコピー

### 方法2: tobiratory-webから取得
tobiratory-webプロジェクトの`.env`ファイルや設定ファイルから同じ値をコピー

## 設定後の確認

1. `.env`ファイルを更新
2. 開発サーバーを再起動：
   ```bash
   # Ctrl+C で一度停止してから
   npm run dev
   ```
3. http://localhost:5000/login にアクセス
4. Googleログインボタンをクリックして動作確認

## トラブルシューティング

### エラー: "auth/invalid-api-key"
→ API_KEYが正しく設定されていません

### エラー: "auth/unauthorized-domain"
→ Firebase ConsoleでlocalHost:5000を許可ドメインに追加する必要があります
   1. Firebase Console → Authentication → Settings → Authorized domains
   2. `localhost`を追加

### エラー: CORSエラー
→ Cloud FunctionsのCORS設定を確認してください

## 注意事項

- `PUBLIC_`プレフィックスが付いた環境変数はクライアント側で使用されます
- Firebaseの認証情報は公開されても問題ない設計ですが、GitHubにはpushしないでください
- `.env`ファイルは`.gitignore`に含まれています

---

設定が完了したら、ログイン機能が使えるようになります！