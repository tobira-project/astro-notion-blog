import React, { useState } from 'react'
import type { ErrorMessage } from './AuthTemplate'

interface EmailAndPasswordSignUpProps {
  title: string
  buttonText: string
  email: string
  isSubmitting: boolean
  authError: ErrorMessage
  onClickBack: () => void
  onClickSubmit: (email: string, password: string) => Promise<void>
}

const EmailAndPasswordSignUp: React.FC<EmailAndPasswordSignUpProps> = ({
  title,
  buttonText,
  email,
  isSubmitting,
  authError,
  onClickBack,
  onClickSubmit
}) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください')
      return
    }
    
    setError(null)
    await onClickSubmit(email, password)
  }

  return (
    <div className="email-password-container">
      <button className="back-button" onClick={onClickBack}>
        ← 戻る
      </button>
      
      <form onSubmit={handleSubmit} className="password-form">
        <h2>{title}</h2>
        <p className="email-display">{email}</p>
        
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password-input"
          autoFocus
          required
          minLength={6}
        />
        
        <input
          type="password"
          placeholder="パスワード（確認）"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="password-input"
          required
          minLength={6}
        />
        
        {(error || authError) && (
          <div className="error-message">
            {error || authError?.message}
          </div>
        )}
        
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !password || !confirmPassword}
        >
          {isSubmitting ? '登録中...' : buttonText}
        </button>
      </form>
    </div>
  )
}

export default EmailAndPasswordSignUp