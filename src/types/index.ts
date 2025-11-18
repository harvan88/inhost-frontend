/**
 * Frontend-specific types for INHOST
 * These types match the API contracts from the backend
 */

export interface Message {
  id: string;
  type: 'incoming' | 'outgoing' | 'system' | 'status';
  channel: 'whatsapp' | 'telegram' | 'web' | 'sms';
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
