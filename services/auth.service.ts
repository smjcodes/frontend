import { apiRequest } from '@/lib/api-client';
import { getToken, saveAuth } from '@/lib/auth';
import type { AuthResponse, User } from '@/lib/types';

export const login = async (identifier: string, password: string) => {
  const previousToken = getToken();

  if (previousToken) {
    try {
      await apiRequest<{ data: { loggedOut: boolean } }>('/api/auth/logout', {
        method: 'POST',
        token: previousToken,
      });
    } catch {
      // If the previous token is already invalid, continue with the new login.
    }
  }

  const authResponse = await apiRequest<AuthResponse>('/api/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

  let user: User = authResponse.user;

  try {
    user = await apiRequest<User>('/api/users/me?populate=role', {
      token: authResponse.jwt,
    });
  } catch {
    user = authResponse.user;
  }

  saveAuth(authResponse.jwt, user);

  return {
    jwt: authResponse.jwt,
    user,
  };
};
