import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type { ErrorResponse } from '../types';
import { tokenStore } from './tokenStore';

type AuthHandlers = {
  refreshAccessToken: () => Promise<string | null>;
  onAuthFailure: () => void;
};

let authHandlers: AuthHandlers | null = null;
let refreshPromise: Promise<string | null> | null = null;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerApiAuthHandlers = (handlers: AuthHandlers | null) => {
  authHandlers = handlers;
};

api.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = originalRequest?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && authHandlers && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      refreshPromise ??= authHandlers.refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const nextAccessToken = await refreshPromise;

      if (nextAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(originalRequest);
      }

      authHandlers.onAuthFailure();
    }

    return Promise.reject(error);
  },
);
