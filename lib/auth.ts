import { apiRequest } from './api-client';
import type { Contest, ContestAccessLevel, User } from './types';

const TOKEN_KEY = 'contest-demo-jwt';
const USER_KEY = 'contest-demo-user';
const AUTH_EVENT = 'contest-demo-auth-changed';

const isBrowser = () => typeof window !== 'undefined';

const dispatchAuthChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

const clearStoredAuth = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  dispatchAuthChange();
};

export const saveAuth = (jwt: string, user: User) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, jwt);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  dispatchAuthChange();
};

export const getToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): User | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const logout = async () => {
  if (!isBrowser()) {
    return;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);

  try {
    if (token) {
      await apiRequest<{ data: { loggedOut: boolean } }>('/api/auth/logout', {
        method: 'POST',
        token,
      });
    }
  } catch {
    // Clear local auth even if the revoke request fails so the user is not stuck.
  }

  clearStoredAuth();
};

export const isLoggedIn = () => Boolean(getToken() && getUser());

export const getUserRole = (user: User | null = getUser()) => user?.role?.type || null;

export const isContestAdmin = (user: User | null = getUser()) =>
  getUserRole(user) === 'contest-admin';

export const canParticipateInContest = (
  user: User | null,
  contestOrAccessLevel: Contest | ContestAccessLevel
) => {
  if (!user) {
    return false;
  }

  const accessLevel =
    typeof contestOrAccessLevel === 'string'
      ? contestOrAccessLevel
      : contestOrAccessLevel.accessLevel;

  if (accessLevel === 'NORMAL') {
    return true;
  }

  return user.userType === 'VIP';
};

export const subscribeToAuthChanges = (callback: () => void) => {
  if (!isBrowser()) {
    return () => undefined;
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY || event.key === USER_KEY) {
      callback();
    }
  };

  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
};
