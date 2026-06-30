import { apiRequest } from '@/lib/api-client';
import type {
  ApiResponse,
  Contest,
  ContestDetail,
  JoinContestResponse,
  LeaderboardResponse,
  PrizeWinner,
  SubmitContestPayload,
  SubmitContestResponse,
} from '@/lib/types';

export const getContests = async () => {
  const response = await apiRequest<ApiResponse<Contest[]>>('/api/contests');
  return response.data;
};

export const getContestById = async (id: string) => {
  const response = await apiRequest<ApiResponse<ContestDetail>>(`/api/contests/${id}`);
  return response.data;
};

export const joinContest = async (id: string, token: string) => {
  const response = await apiRequest<ApiResponse<JoinContestResponse>>(
    `/api/contests/${id}/join`,
    {
      method: 'POST',
      token,
    }
  );

  return response.data;
};

export const submitContest = async (
  id: string,
  payload: SubmitContestPayload,
  token: string
) => {
  const response = await apiRequest<ApiResponse<SubmitContestResponse>>(
    `/api/contests/${id}/submit`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }
  );

  return response.data;
};

export const getLeaderboard = async (id: string) => {
  const response = await apiRequest<ApiResponse<LeaderboardResponse>>(
    `/api/contests/${id}/leaderboard`
  );

  return response.data;
};

export const awardPrize = async (id: string, token: string) => {
  const response = await apiRequest<ApiResponse<PrizeWinner>>(
    `/api/contests/${id}/award-prize`,
    {
      method: 'POST',
      token,
    }
  );

  return response.data;
};
