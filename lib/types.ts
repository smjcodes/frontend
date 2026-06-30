export type UserType = 'NORMAL' | 'VIP';
export type ContestAccessLevel = 'NORMAL' | 'VIP';
export type QuestionType = 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TRUE_FALSE';
export type ParticipationStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface UserRole {
  id?: number | string;
  name?: string;
  type?: string;
}

export interface User {
  id: number | string;
  documentId?: string;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userType: UserType;
  role?: UserRole;
}

export interface AuthResponse {
  jwt: string;
  user: User;
  refreshToken?: string;
}

export interface Option {
  id: string;
  documentId?: string;
  text: string;
}

export interface Question {
  id: string;
  documentId?: string;
  text: string;
  questionType: QuestionType;
  points: number;
  options: Option[];
}

export interface Contest {
  id: string;
  documentId?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  accessLevel: ContestAccessLevel;
  prizeInfo: string | null;
  isActive: boolean;
  questionCount: number;
  hasPrizeWinner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContestDetail extends Contest {
  questions: Question[];
}

export interface Participation {
  id: string;
  documentId?: string;
  status: ParticipationStatus;
  score: number;
  startedAt: string;
  submittedAt: string | null;
}

export interface HistoryEntry extends Participation {
  contest: Contest | null;
  prizeAwarded: boolean;
}

export interface PrizeWinner {
  id: string;
  documentId?: string;
  awardedAt: string;
  prizeInfo: string | null;
  contest: Contest | null;
  participation: Participation | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    userType: UserType;
  };
  score: number;
  submittedAt: string | null;
}

export interface LeaderboardResponse {
  contest: Contest;
  entries: LeaderboardEntry[];
}

export interface JoinContestResponse {
  contest: Contest;
  participation: Participation;
}

export interface SubmitContestResponse {
  contest: Contest;
  participation: Participation;
  score: number;
}

export interface AnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SubmitContestPayload {
  answers: AnswerPayload[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    count?: number;
  };
}

export interface ApiErrorPayload {
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}
