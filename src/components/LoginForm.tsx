import React, { useState, useEffect } from 'react'
import { useTobiratoryAuth } from '../hooks/useTobiratoryAuth'

interface LoginFormProps {
  redirectUrl?: string
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectUrl = '/' }) => {
  const {
    user,
    profile,
    loading,
    error,
    isCreatingAccount,
    accountStatus,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    setError
  } = useTobiratoryAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // ログイン完了後のリダイレクト
  useEffect(() => {
    if (accountStatus === 'complete' && user) {
      window.location.href = redirectUrl
    }
  }, [accountStatus, user, redirectUrl])

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // エラーはフック内で処理される
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use' && isSignUp) {
        // 既に使用されているメールの場合、ログインモードに切り替え
        setIsSignUp(false)
        setError('このメールアドレスは既に登録されています。ログインしてください。')
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // アカウント作成中の表示
  if (isCreatingAccount) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-container">
            <div className="spinner"></div>
            <h2>アカウントを準備中...</h2>
            <p>{accountStatus}</p>
            <p className="note">
              この処理には時間がかかる場合があります。<br />
              ブラウザを閉じても、次回ログイン時に続きから処理されます。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ログイン済みの表示
  if (user && accountStatus === 'complete') {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>ログイン済み</h2>
          <p>ようこそ、{user.email || user.displayName}さん</p>
          <button onClick={handleLogout} className="logout-btn">
            ログアウト
          </button>
        </div>
      </div>
    )
  }

  // ログインフォーム
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handleGoogleLogin} 
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-0.5 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? '処理中...' : 'Googleでログイン'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">または</span>
        </div>
      </div>
      
      <form onSubmit={handleEmailAuth} className="space-y-6">
        <div className="form-group">
          <label className="form-label">メールアドレス</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">パスワード</label>
          <input
            type="password"
            placeholder="パスワードを入力"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="form-input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary btn-full">
          {loading ? '処理中...' : (isSignUp ? '登録' : 'ログイン')}
        </button>
      </form>
      
      <div className="text-center text-sm">
        {isSignUp ? (
          <>
            既にアカウントをお持ちですか？
            <button 
              onClick={() => setIsSignUp(false)} 
              className="text-orange-500 hover:text-orange-600 font-medium ml-2 transition-colors"
            >
              ログイン
            </button>
          </>
        ) : (
          <>
            アカウントをお持ちでない方は
            <button 
              onClick={() => setIsSignUp(true)} 
              className="text-orange-500 hover:text-orange-600 font-medium ml-2 transition-colors"
            >
              新規登録
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginForm