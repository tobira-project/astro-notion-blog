import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase-client';

const AuthStatus: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-4 shadow-lg">
        <span className="text-white font-semibold text-sm">
          {user.displayName || user.email?.split('@')[0]}
        </span>
        <button
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/40 px-4 py-2 rounded-lg text-sm transition-all duration-300"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <a
      href="/login"
      className="px-8 py-4 bg-white/95 hover:bg-white text-gray-800 font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/50 min-w-[140px] text-center"
    >
      ログイン
    </a>
  );
};

export default AuthStatus;
