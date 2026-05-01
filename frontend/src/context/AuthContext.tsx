import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import type { AuthSession, User } from '../types';
import { authApi } from '../lib/authApi';
import { registerApiAuthHandlers } from '../lib/api';
import { tokenStore } from '../lib/tokenStore';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const applySession = (session: AuthSession, setUser: (user: User | null) => void) => {
  tokenStore.set(session.accessToken);
  setUser(session.user);
};

const clearSession = (setUser: (user: User | null) => void) => {
  tokenStore.clear();
  setUser(null);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshAccessToken = async () => {
    try {
      const response = await authApi.refresh();
      applySession(response.data, setUser);
      return response.data.accessToken;
    } catch (_error) {
      clearSession(setUser);
      return null;
    }
  };

  useEffect(() => {
    registerApiAuthHandlers({
      refreshAccessToken,
      onAuthFailure: () => clearSession(setUser),
    });

    return () => {
      registerApiAuthHandlers(null);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      await refreshAccessToken();
      if (active) {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isBootstrapping,
    async login(payload) {
      const response = await authApi.login(payload);
      applySession(response.data, setUser);
    },
    async register(payload) {
      const response = await authApi.register(payload);
      applySession(response.data, setUser);
    },
    async logout() {
      try {
        await authApi.logout();
      } finally {
        clearSession(setUser);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
