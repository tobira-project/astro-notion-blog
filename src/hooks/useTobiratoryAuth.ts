// tobiratory-webのコードを活用したカスタムフック
import { useState, useEffect } from 'react'
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, API_URL } from '../lib/firebase-client'

// プロフィール情報の型定義
interface ProfileResponse {
  status: 'success' | 'error'
  data: any
}

// アカウントステータス
enum AccountStatus {
  SUCCESS = 'success',
  ACCOUNT_NOT_EXISTS = 'account-not-exists',
  FLOW_ACCOUNT_NOT_EXISTS = 'flow-account-not-exists',
  FLOW_ADDRESS_CREATING = 'flow-address-creating',
  FLOW_ACCOUNT_RETRYING = 'flow-account-retrying',
  FLOW_ACCOUNT_CREATE_ERROR = 'flow-account-create-error'
}

// Flowアカウントが処理中かどうか判定
const isFlowAccountProcessing = (status: string) => {
  return [
    AccountStatus.FLOW_ADDRESS_CREATING,
    AccountStatus.FLOW_ACCOUNT_RETRYING
  ].includes(status as AccountStatus)
}

export const useTobiratoryAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [accountStatus, setAccountStatus] = useState<string>('')

  // Firebase認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await checkProfile()
      }
    })
    return unsubscribe
  }, [])

  // プロフィール取得
  const fetchMyProfile = async (): Promise<ProfileResponse> => {
    const idToken = await auth.currentUser?.getIdToken()
    if (!idToken) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_URL}/native/my/profile`, {
      method: 'GET',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    })
    
    return await response.json()
  }

  // プロフィール確認
  const checkProfile = async () => {
    try {
      const profileData = await fetchMyProfile()
      setProfile(profileData)
      
      if (profileData.status === 'success') {
        setAccountStatus('complete')
        return profileData
      } else {
        setAccountStatus(profileData.data)
        // アカウント作成が必要な場合
        if (profileData.data !== AccountStatus.SUCCESS) {
          await handleAccountRegistration(profileData.data)
        }
      }
    } catch (error) {
      console.error('Profile check error:', error)
      setError('プロフィール取得に失敗しました')
    }
  }

  // Tobiratoryアカウントとflowアカウントの登録
  const registerToTobiratoryAndFlowAccount = async () => {
    const idToken = await auth.currentUser?.getIdToken(true)
    if (!idToken) throw new Error('Not authenticated')
    
    // Tobiratoryアカウント作成
    const signupRes = await fetch(`${API_URL}/native/signup`, {
      method: 'POST',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      }
    })
    
    if (!signupRes.ok) {
      throw new Error('Tobiratory account creation failed')
    }
    
    // Flowアカウント作成
    const flowRes = await fetch(`${API_URL}/native/create-flow`, {
      method: 'POST',
      headers: {
        'Authorization': idToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locale: 'ja' })
    })
    
    return flowRes
  }

  // Flowアカウント作成待機
  const waitFlowAccountCreation = async (): Promise<ProfileResponse | null> => {
    const maxRetry = 100
    const sleepTime = 10000 // 10秒
    
    for (let i = 0; i < maxRetry; i++) {
      await new Promise(resolve => setTimeout(resolve, sleepTime))
      
      const profileData = await fetchMyProfile()
      
      if (profileData.status === 'success') {
        return profileData
      } else if (profileData.data === AccountStatus.FLOW_ACCOUNT_CREATE_ERROR) {
        // エラーの場合は再作成
        const idToken = await auth.currentUser?.getIdToken()
        if (idToken) {
          await fetch(`${API_URL}/native/create-flow`, {
            method: 'POST',
            headers: {
              'Authorization': idToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ locale: 'ja' })
          })
        }
      }
    }
    
    return null
  }

  // アカウント登録処理
  const handleAccountRegistration = async (status: string) => {
    setIsCreatingAccount(true)
    setError(null)
    
    try {
      switch (status) {
        case AccountStatus.ACCOUNT_NOT_EXISTS:
          setAccountStatus('Tobiratoryアカウントを作成中...')
          await registerToTobiratoryAndFlowAccount()
          const result = await waitFlowAccountCreation()
          if (result && result.status === 'success') {
            setProfile(result)
            setAccountStatus('complete')
          }
          break
          
        case AccountStatus.FLOW_ACCOUNT_NOT_EXISTS:
        case AccountStatus.FLOW_ADDRESS_CREATING:
        case AccountStatus.FLOW_ACCOUNT_RETRYING:
          setAccountStatus('Flowアカウントを作成中（時間がかかる場合があります）...')
          const waitResult = await waitFlowAccountCreation()
          if (waitResult && waitResult.status === 'success') {
            setProfile(waitResult)
            setAccountStatus('complete')
          }
          break
          
        case AccountStatus.FLOW_ACCOUNT_CREATE_ERROR:
          setAccountStatus('Flowアカウント作成エラー。再試行中...')
          // 再作成を試みる
          const idToken = await auth.currentUser?.getIdToken()
          if (idToken) {
            await fetch(`${API_URL}/native/create-flow`, {
              method: 'POST',
              headers: {
                'Authorization': idToken,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ locale: 'ja' })
            })
            const retryResult = await waitFlowAccountCreation()
            if (retryResult && retryResult.status === 'success') {
              setProfile(retryResult)
              setAccountStatus('complete')
            }
          }
          break
      }
    } catch (error: any) {
      console.error('Account registration error:', error)
      setError('アカウント作成に失敗しました。もう一度お試しください。')
    } finally {
      setIsCreatingAccount(false)
    }
  }

  // Googleログイン
  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      // onAuthStateChangedが自動的にcheckProfileを呼ぶ
      return result.user
    } catch (error: any) {
      setError(error.message || 'Googleログインに失敗しました')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // メールログイン
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      // onAuthStateChangedが自動的にcheckProfileを呼ぶ
      return result.user
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setError('パスワードが間違っています')
      } else if (error.code === 'auth/user-not-found') {
        setError('ユーザーが見つかりません')
      } else {
        setError(error.message || 'ログインに失敗しました')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  // メール新規登録
  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      // onAuthStateChangedが自動的にcheckProfileを呼ぶ
      return result.user
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています')
      } else {
        setError(error.message || '登録に失敗しました')
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ログアウト
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setProfile(null)
      setAccountStatus('')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
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
  }
}