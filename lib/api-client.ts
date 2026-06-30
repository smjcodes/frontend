import type { ApiErrorPayload } from './types';

export class ApiClientError extends Error {
  status: number;
  payload?: ApiErrorPayload | unknown;

  constructor(message: string, status: number, payload?: ApiErrorPayload | unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  token?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const getApiUrl = () => API_URL;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    body,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  let json: unknown = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!response.ok) {
    const payload = (json || {}) as ApiErrorPayload;
    const message =
      payload.error?.message || payload.message || `Request failed with status ${response.status}`;

    throw new ApiClientError(message, response.status, payload);
  }

  return json as T;
}
