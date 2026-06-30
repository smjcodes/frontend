import { apiRequest } from '@/lib/api-client';
import type { ApiResponse, HistoryEntry, PrizeWinner, User } from '@/lib/types';

export const getMe = async (token: string, includeRole = false) => {
  return apiRequest<User>(includeRole ? '/api/users/me?populate=role' : '/api/users/me', {
    token,
  });
};

export const getHistory = async (token: string) => {
  const response = await apiRequest<ApiResponse<HistoryEntry[]>>('/api/me/history', { token });
  return response.data;
};

export const getInProgress = async (token: string) => {
  const response = await apiRequest<ApiResponse<HistoryEntry[]>>('/api/me/in-progress', { token });
  return response.data;
};

export const getPrizes = async (token: string) => {
  const response = await apiRequest<ApiResponse<PrizeWinner[]>>('/api/me/prizes', { token });
  return response.data;
};
