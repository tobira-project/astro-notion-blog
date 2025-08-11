import React from 'react';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';

export type LoginFormType = {
  email: string;
};

export type ErrorMessage = {
  code: string;
  message: string;
} | null;

interface AuthTemplateProps {
  loading: boolean;
  googleLabel: string;
  appleLabel: string;
  mailLabel: string;
  prompt: string;
  setAuthState: () => void;
  withMail: (data: LoginFormType) => void;
  withGoogle: () => Promise<void>;
  withApple: () => Promise<void>;
  authError?: ErrorMessage;
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({
  loading,
  googleLabel,
  appleLabel,
  mailLabel,
  prompt,
  setAuthState,
  withMail,
  withGoogle,
  withApple,
  authError,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className="auth-template">
      <form className="auth-form" onSubmit={handleSubmit(withMail)}>
        <div className="logo-container">
          <h1 className="logo-text">TOBIRACAST</h1>
        </div>

        <div className="button-container">
          <GoogleButton label={googleLabel} onClick={withGoogle} />
        </div>

        <div className="button-container">
          <AppleButton label={appleLabel} onClick={withApple} />
        </div>

        <div className="divider-container">
          <span className="divider-text">or</span>
        </div>

        <div className="input-container">
          <input
            type="email"
            placeholder="メールアドレス"
            className="email-input"
            {...register('email', {
              required: 'メールアドレスを入力してください',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '有効なメールアドレスを入力してください',
              },
            })}
          />
        </div>

        <div className="error-container">
          {errors.email && (
            <div className="error-message">{errors.email.message}</div>
          )}
          {authError && (
            <div className="error-message">{authError.message}</div>
          )}
        </div>

        <LoadingSpinnerButton
          type="submit"
          label={mailLabel}
          loading={loading}
        />

        <div className="prompt-container">
          <button type="button" onClick={setAuthState} className="prompt-link">
            {prompt}
          </button>
        </div>
      </form>
    </div>
  );
};

export const GoogleButton: React.FC<{
  label: string;
  onClick: () => Promise<void>;
}> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      className="social-button google-button"
      onClick={onClick}
    >
      <svg className="social-icon" viewBox="0 0 24 24">
        <path
          fill="#4285f4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34a853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#fbbc05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#ea4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export const AppleButton: React.FC<{
  label: string;
  onClick: () => Promise<void>;
}> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      className="social-button apple-button"
      onClick={onClick}
    >
      <svg className="social-icon" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export const LoadingSpinnerButton: React.FC<{
  type?: 'button' | 'submit' | 'reset';
  label: string;
  loading: boolean;
  onClick?: () => void;
}> = ({ type = 'button', label, loading, onClick }) => {
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <button type={type} className="submit-button" onClick={onClick}>
      {label}
    </button>
  );
};

export default AuthTemplate;
