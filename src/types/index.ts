/**
 * Frontend-specific types for INHOST
 * These types match the API contracts from the backend
 */

export type MessageType = 'incoming' | 'outgoing' | 'system' | 'status';
export type ChannelType = 'whatsapp' | 'telegram' | 'web' | 'sms';

export interface Message {
  id: string;
  type: MessageType;
  channel: ChannelType;
  content: {
    text: string;
  };
  metadata: {
    from: string;
    to: string;
    timestamp: string;
  };
  status?: {
    state: string;
    timestamp: string;
  };
}

export interface MessagePayload {
  type: 'incoming' | 'outgoing' | 'system';
  channel: ChannelType;
  content: {
    text: string;
  };
  metadata: {
    from: string;
    to: string;
    timestamp: string;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error' | 'unknown';
  timestamp?: string;
  version?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebSocketMessage {
  type: string;
  data?: unknown;
}

export interface ErrorNotification {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}
