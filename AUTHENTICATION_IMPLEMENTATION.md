# 認証システム実装レポート

## 実装概要

tobiratory-webの認証フローを参考に、Pure Astroで完全に同一の認証システムを実装しました。

## 実装方法

### 1. 参考にしたファイル
`tobiratory-web/packages/fetchers/adminUserAccount.ts` のコードを詳細に分析し、以下の処理を完全に再現：

- **95行目**: `fetch('/backend/api/functions/native/signup')` - Tobiratoryアカウント作成
- **108行目**: `fetch('/backend/api/functions/native/create-flow')` - Flowアカウント作成
- **118行目**: `waitFlowAccountCreation()` - 10秒間隔でのポーリング処理

### 2. 実装したファイルと処理フロー

#### `src/pages/login.astro` - 1つのファイルに全機能を実装

**A. Firebase Authentication設定**
```javascript
// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  // ... 他の設定項目
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
```

**B. API呼び出し関数の実装**
```javascript
// Tobiratoryアカウント作成（95行目と同じ処理）
async function createTobiratoryAccount(idToken) {
  const signupResponse = await fetch(`${API_URL}/native/signup`, {
    method: 'POST',
    headers: {
      'Authorization': idToken,
      'Content-Type': 'application/json'
    }
  })
  
  if (!signupResponse.ok) {
    throw new Error('Tobiratoryアカウント作成に失敗しました')
  }
}

// Flowアカウント作成（108行目と同じ処理）
async function createFlowAccount(idToken) {
  const flowResponse = await fetch(`${API_URL}/native/create-flow`, {
    method: 'POST',
    headers: {
      'Authorization': idToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ locale: 'ja' })
  })
  
  if (!flowResponse.ok) {
    throw new Error('Flowアカウント作成リクエストに失敗しました')
  }
  
  await pollForCompletion(idToken)
}

// ポーリング処理（118行目のwaitFlowAccountCreation()と同じ）
async function pollForCompletion(idToken) {
  const maxRetry = 100
  const sleepTime = 10000  // 10秒間隔
  
  for (let i = 0; i < maxRetry; i++) {
    await new Promise(resolve => setTimeout(resolve, sleepTime))
    
    // プロフィール確認
    const checkResponse = await fetch(`${API_URL}/native/my/profile`, {
      method: 'GET',
      headers: {
        'Authorization': await auth.currentUser?.getIdToken(),
        'Content-Type': 'application/json'
      }
    })
    
    const checkProfile = await checkResponse.json()
    
    if (checkProfile.status === 'success') {
      showLoading('アカウント作成完了')
      setTimeout(() => window.location.href = '/', 1000)
      return
    } else if (checkProfile.status === 'error' && checkProfile.data === 'flow-account-create-error') {
      // エラー時は再試行
      await createFlowAccount(await auth.currentUser?.getIdToken())
      return
    }
  }
  
  throw new Error('アカウント作成がタイムアウトしました')
}
```

**C. メイン認証フロー**
```javascript
async function handleTobiratoryAccountSetup() {
  try {
    showLoading('プロフィール確認中...')
    
    const idToken = await auth.currentUser?.getIdToken()
    
    // 1. プロフィール取得（tobiratory-webと同じAPI）
    const profileResponse = await fetch(`${API_URL}/native/my/profile`, {
      method: 'GET',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    })
    
    const profile = await profileResponse.json()
    
    // 2. レスポンス形式対応
    if (profile.status === 'success') {
      // 既存ユーザー - ログイン完了
      showLoading('ログイン完了')
      setTimeout(() => window.location.href = '/', 1000)
      return
    }
    
    // 3. エラーステータス別の処理
    if (profile.status === 'error') {
      switch (profile.data) {
        case 'account-not-exists':
          // 新規ユーザー - 両方のアカウント作成
          showLoading('Tobiratoryアカウントを作成中...')
          await createTobiratoryAccount(idToken)
          showLoading('Flowアカウントを作成中...')
          await createFlowAccount(idToken)
          return
          
        case 'flow-account-not-exists':
          // Tobiratoryアカウントはあるが、Flowアカウントなし
          showLoading('Flowアカウントを作成中...')
          await createFlowAccount(idToken)
          return
          
        case 'flow-address-creating':
        case 'flow-account-retrying':
          // 作成中 - 待機継続
          showLoading('Flowアカウント作成中（処理継続中）...')
          await pollForCompletion(idToken)
          return
          
        case 'flow-account-create-error':
          // エラー - 再作成
          showLoading('エラー発生 - Flowアカウント再作成中...')
          await createFlowAccount(idToken)
          return
      }
    }
    
  } catch (error) {
    console.error('Account setup error:', error)
    showForm()
    showError(error.message || 'アカウント作成に失敗しました')
  }
}
```

**D. Firebase認証イベント処理**
```javascript
// 認証状態監視（ブラウザ復帰対応）
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // ログイン済み - アカウント設定フローを開始
    await handleTobiratoryAccountSetup()
  } else {
    // 未ログイン - ログインフォーム表示
    showForm()
  }
})

// Google認証
googleLoginBtn.addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    // onAuthStateChangedが自動的にhandleTobiratoryAccountSetup()を呼ぶ
  } catch (error) {
    showError('Googleログインに失敗しました')
  }
})

// Apple認証
appleLoginBtn.addEventListener('click', async () => {
  try {
    const provider = new OAuthProvider('apple.com')
    await signInWithPopup(auth, provider)
  } catch (error) {
    showError('Appleログインに失敗しました')
  }
})

// Magic Link認証
emailForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email-input').value
  
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem('emailForSignIn', email)
    showError('ログインリンクを送信しました。メールをご確認ください。')
  } catch (error) {
    showError('メール送信に失敗しました。')
  }
})
```

### 3. 実装のポイント

#### API統合
- **エンドポイント**: `https://asia-northeast1-tobiratory-f6ae1.cloudfunctions.net`
- **認証**: Firebase IDトークンをAuthorizationヘッダーに設定
- **レスポンス**: `{ status: "success/error", data: ... }` 形式に対応

#### エラーハンドリング
- 全6種類のステータス（success, account-not-exists, flow-account-not-exists, flow-address-creating, flow-account-retrying, flow-account-create-error）に対応
- 自動リトライ機能付き

#### ユーザーエクスペリエンス
- リアルタイムの状態表示（「アカウント作成中...」等）
- ブラウザを閉じても処理が継続される設計
- 10秒間隔のポーリングでサーバー負荷を最小化

## 動作確認について相談したいこと

実装した認証システムの動作確認を行いたいのですが、以下について教えてください：

### 1. 環境設定について
- Google/Apple認証の設定で追加で必要な作業はありますか？

### 2. 実際の動作テストについて
- 新規ユーザーでテストする場合、どのメールアドレスを使用すればよいですか？テスト用のGoogleアカウント/Appleアカウントはありますか？

### 3. エラーパターンの確認について
- `account-not-exists`, `flow-account-not-exists`などの各エラー状態をどうやって再現してテストできますか？
- Flowアカウント作成の長時間処理（10秒ポーリング）を実際に確認する方法はありますか？

### 4. 期待する動作について
- ログイン成功後の画面遷移先は`/`（ホーム）で正しいですか？
- 何か他に確認すべき動作や設定はありますか？

### テストしたい内容
1. Google認証でのログイン・新規登録
2. Apple認証でのログイン・新規登録  
3. Magic Linkメール認証
4. アカウント作成の完了まで待機
5. ブラウザを閉じて再開した時の処理継続

## 技術的な実装ポイント

- Pure Astroによる実装（React依存なし）
- tobiratory-webと完全同一のAPI呼び出し
- 10秒間隔のポーリング処理
- エラーハンドリングとリトライ機能
- レスポンシブデザイン対応