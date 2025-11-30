import apiClient from './api';
import type {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ScanRequest,
  Match,
  MatchesResponse,
  Notification,
} from '@/model/types';

/**
 * Auth API endpoints
 */
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
  },

  getUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/user');
    return response.data;
  },

  getPublicUser: async (id: string | number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
};

/**
 * Match API endpoints
 */
export const matchAPI = {
  scan: async (data: ScanRequest): Promise<Match> => {
    const response = await apiClient.post<Match>('/matches/scan', data);
    return response.data;
  },

  accept: async (id: number): Promise<Match> => {
    const response = await apiClient.post<Match>(`/matches/${id}/accept`);
    return response.data;
  },

  getMatches: async (): Promise<MatchesResponse> => {
    const response = await apiClient.get<MatchesResponse>('/matches');
    return response.data;
  },

  getMatch: async (id: number): Promise<Match> => {
    const response = await apiClient.get<Match>(`/matches/${id}`);
    return response.data;
  },
};

/**
 * Notification API endpoints
 */
export const notificationAPI = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiClient.post<Notification>(`/notifications/${id}/read`);
    return response.data;
  },
};
