import React, { useState } from 'react';
import type { ErrorMessage } from './AuthTemplate';

interface EmailAndPasswordSignInProps {
  email: string;
  loading: boolean;
  error: ErrorMessage;
  onClickBack: () => void;
  onClickPasswordReset: (email: string) => void;
  withMailSignIn: (email: string, password: string) => Promise<void>;
}

const EmailAndPasswordSignIn: React.FC<EmailAndPasswordSignInProps> = ({
  email,
  loading,
  error,
  onClickBack,
  onClickPasswordReset,
  withMailSignIn,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await withMailSignIn(email, password);
  };

  return (
    <div className="email-password-container">
      <button className="back-button" onClick={onClickBack}>
        ← 戻る
      </button>

      <form onSubmit={handleSubmit} className="password-form">
        <h2>パスワードを入力</h2>
        <p className="email-display">{email}</p>

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password-input"
          autoFocus
          required
        />

        {error && <div className="error-message">{error.message}</div>}

        <button
          type="submit"
          className="submit-button"
          disabled={loading || !password}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>

        <button
          type="button"
          className="forgot-password-link"
          onClick={() => onClickPasswordReset(email)}
        >
          パスワードを忘れた方
        </button>
      </form>
    </div>
  );
};

export default EmailAndPasswordSignIn;
