/**
 * User type definition
 */
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

/**
 * Match type definition
 */
export interface Match {
  id: number;
  scanner_id: number;
  scanned_id: number;
  reason?: string;
  scanner_status: boolean;
  scanned_status: boolean;
  created_at: string;
  updated_at: string;
  scanner?: User;
  scanned?: User;
}

/**
 * Notification type enum
 */
export type NotificationType = 'Scanner' | 'Scanned';

/**
 * Notification type definition
 */
export interface Notification {
  id: number;
  type: NotificationType;
  scanner_id: number;
  scanned_id: number;
  status: boolean;
  read: boolean;
  created_at: string;
  updated_at: string;
  scanner?: User;
  scanned?: User;
}

/**
 * API Response types
 */
export interface AuthResponse {
  message: string;
  user?: User;
  token?: string;
}

export interface MatchesResponse {
  scans: Match[];
  scanned_by: Match[];
}

/**
 * API Request types
 */
export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ScanRequest {
  scanned_id: number;
  reason?: string;
}
