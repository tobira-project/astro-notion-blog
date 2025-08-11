import React, { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase-client';
import { useTobiratoryAuth } from '../hooks/useTobiratoryAuth';
import AuthTemplate from './auth/AuthTemplate';
import type { LoginFormType, ErrorMessage } from './auth/AuthTemplate';
import EmailAndPasswordSignIn from './auth/EmailAndPasswordSignIn';
import EmailAndPasswordSignUp from './auth/EmailAndPasswordSignUp';

// tobiratory-webと同じ認証状態
const AuthStates = {
  SignUp: 0,
  SignIn: 1,
  SignInWithEmailAndPassword: 2,
  SignUpWithEmailAndPassword: 3,
  PasswordReset: 4,
  ConfirmationEmailSent: 5,
  PasswordResetConfirmationEmailSent: 6,
} as const;

type AuthState = (typeof AuthStates)[keyof typeof AuthStates];

interface TobiratoryLoginProps {
  redirectUrl?: string;
}

const TobiratoryLogin: React.FC<TobiratoryLoginProps> = ({
  redirectUrl = '/',
}) => {
  const { accountStatus, isCreatingAccount } = useTobiratoryAuth();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState<ErrorMessage>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(AuthStates.SignIn);
  const [
    isRegisteringWithMailAndPassword,
    setIsRegisteringWithMailAndPassword,
  ] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && accountStatus === 'complete') {
        window.location.href = redirectUrl;
      }
    });
    return unsubscribe;
  }, [accountStatus, redirectUrl]);

  // メール認証のスタート（サインアップ）
  const startMailSignUp = async (data: LoginFormType) => {
    if (!data) return;

    const usedPasswordAuthenticationAlready = await usedPasswordAuthentication(
      data.email
    );

    setEmail(data.email);
    if (usedPasswordAuthenticationAlready) {
      setAuthState(AuthStates.SignInWithEmailAndPassword);
    } else {
      setAuthState(AuthStates.SignUpWithEmailAndPassword);
    }
  };

  // メール認証のスタート（サインイン）
  const startMailSignIn = async (data: LoginFormType) => {
    if (!data) return;

    setEmail(data.email);
    setAuthState(AuthStates.SignInWithEmailAndPassword);
  };

  // パスワード認証を使用しているかチェック
  const usedPasswordAuthentication = async (email: string) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.includes(
        EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD
      );
    } catch {
      return false;
    }
  };

  // メールでサインアップ
  const withMailSignUp = async (email: string, password: string) => {
    setIsRegisteringWithMailAndPassword(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // アカウント作成フローは useTobiratoryAuth が自動的に処理
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthState(AuthStates.SignInWithEmailAndPassword);
        return;
      }
      setAuthError({ code: error.code, message: error.message });
      setIsRegisteringWithMailAndPassword(false);
    }
  };

  // メールでサインイン
  const withMailSignIn = async (email: string, password: string) => {
    setIsEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // アカウント確認は useTobiratoryAuth が自動的に処理
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setAuthError({ code: errorCode, message: errorMessage });
      setIsEmailLoading(false);
    }
  };

  // Googleでログイン
  const withGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Googleログインに失敗しました。', error);
    }
  };

  // Appleでログイン
  const withApple = async () => {
    const provider = new OAuthProvider('apple.com');
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Appleログインに失敗しました。', error);
    }
  };

  const handleClickBack = (authState: AuthState) => {
    setIsRegisteringWithMailAndPassword(false);
    setIsEmailLoading(false);
    setAuthError(null);
    setAuthState(authState);
  };

  // アカウント作成中の表示
  if (isCreatingAccount) {
    return (
      <div className="auth-creating">
        <div className="spinner"></div>
        <h2>アカウントを準備中...</h2>
        <p>{accountStatus}</p>
        <p className="note">
          この処理には時間がかかる場合があります。
          <br />
          ブラウザを閉じても、次回ログイン時に続きから処理されます。
        </p>
      </div>
    );
  }

  // 認証フォームの表示
  const AuthForm = () => {
    switch (authState) {
      case AuthStates.SignUp:
        return (
          <AuthTemplate
            loading={isEmailLoading}
            googleLabel="Sign up with Google"
            appleLabel="Sign up with Apple"
            mailLabel="Sign up"
            prompt="Do you already have an account? - SIGN IN"
            setAuthState={() => setAuthState(AuthStates.SignIn)}
            withMail={startMailSignUp}
            withGoogle={withGoogle}
            withApple={withApple}
            authError={authError}
          />
        );

      case AuthStates.SignIn:
        return (
          <AuthTemplate
            loading={isEmailLoading}
            googleLabel="Login with Google"
            appleLabel="Login with Apple"
            mailLabel="Login"
            prompt="Don't have an account? - SIGN UP"
            setAuthState={() => setAuthState(AuthStates.SignUp)}
            withMail={startMailSignIn}
            withGoogle={withGoogle}
            withApple={withApple}
            authError={authError}
          />
        );

      case AuthStates.SignInWithEmailAndPassword:
        return (
          <EmailAndPasswordSignIn
            email={email}
            loading={isEmailLoading}
            error={authError}
            onClickBack={() => handleClickBack(AuthStates.SignIn)}
            onClickPasswordReset={() => {}} // パスワードリセットは後で実装
            withMailSignIn={withMailSignIn}
          />
        );

      case AuthStates.SignUpWithEmailAndPassword:
        return (
          <EmailAndPasswordSignUp
            title="Password"
            buttonText="Sign up"
            email={email}
            isSubmitting={isRegisteringWithMailAndPassword}
            authError={authError}
            onClickBack={() => handleClickBack(AuthStates.SignUp)}
            onClickSubmit={withMailSignUp}
          />
        );

      default:
        return null;
    }
  };

  return <div className="auth-layout">{AuthForm()}</div>;
};

export default TobiratoryLogin;
