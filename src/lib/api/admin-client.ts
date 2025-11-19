// Admin API Client for INHOST Multi-Tenant Admin Dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  tenantName: string;
  plan?: 'starter' | 'professional' | 'enterprise';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
  metadata?: {
    timestamp: string;
  };
}

export interface Conversation {
  id: string;
  endUserId: string;
  channel: string;
  status: 'active' | 'closed' | 'archived';
  lastMessage?: {
    id: string;
    text: string;
    type: 'incoming' | 'outgoing' | 'system';
    timestamp: string;
  };
  unreadCount: number;
  isPinned: boolean;
  assignedTo?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EndUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  lastContactAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'agent';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive?: string;
}

export interface Integration {
  id: string;
  type: 'whatsapp' | 'instagram' | 'messenger' | 'telegram';
  name: string;
  status: 'connected' | 'disconnected';
  connectedAt?: string;
}

export interface SyncInitialData {
  conversations: Conversation[];
  contacts: EndUser[];
  team: TeamMember[];
  integrations: Integration[];
}

export interface Mention {
  id: string;
  entityType: 'message' | 'conversation' | 'feedback' | 'note' | 'assignment';
  entityId: string;
  entityDetails: {
    id: string;
    type?: 'incoming' | 'outgoing';
    text: string;
    conversationId?: string;
    endUser?: {
      id: string;
      name: string;
      externalId: string;
    };
    createdAt: string;
  };
  mentionType: 'user' | 'team' | 'admins' | 'everyone';
  context: string;
  isRead: boolean;
  mentionedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface MessageFeedback {
  id: string;
  messageId: string;
  rating?: 'positive' | 'negative';
  comment?: string;
  suggestedCorrection?: string;
  extensionId?: string;
  givenBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAnalytics {
  period: {
    days: number;
    from: string;
    to: string;
  };
  overall: {
    total: number;
    positive: number;
    negative: number;
    positivePercentage: number;
    negativePercentage: number;
    withComments: number;
    withCorrections: number;
  };
  byExtension: Array<{
    extensionId: string;
    total: number;
    positive: number;
    negative: number;
    positivePercentage: number;
    negativePercentage: number;
  }>;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

class AdminAPIClient {
  private baseURL = API_BASE_URL + '/admin';

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem('inhost_admin_token');

    const res = await fetch(this.baseURL + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers
      }
    });

    if (!res.ok) {
      let errorMessage = `API Error: ${res.statusText}`;
      try {
        const error = await res.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // If parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    return res.json();
  }

  // ==================== Auth ====================

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('inhost_admin_token');
    localStorage.removeItem('inhost_admin_user');
  }

  // ==================== Tenant ====================

  async getTenant() {
    return this.request('/tenant');
  }

  async updateTenant(data: Partial<{
    name: string;
    plan: string;
    settings: Record<string, unknown>;
  }>) {
    return this.request('/tenant', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // ==================== Sync ====================

  async syncInitial(): Promise<{ success: boolean; data: SyncInitialData }> {
    return this.request('/sync/initial');
  }

  // ==================== Conversations ====================

  async getConversations(params?: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'closed' | 'archived';
    channel?: string;
  }): Promise<{ success: boolean; data: { conversations: Conversation[]; total: number } }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/conversations${query ? '?' + query : ''}`);
  }

  async getConversation(id: string): Promise<{ success: boolean; data: { conversation: Conversation } }> {
    return this.request(`/conversations/${id}`);
  }

  async createConversation(data: {
    endUserId: string;
    channel: string;
  }): Promise<{ success: boolean; data: { conversation: Conversation } }> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateConversation(id: string, data: {
    status?: 'active' | 'closed' | 'archived';
    assignedTo?: string;
    isPinned?: boolean;
  }): Promise<{ success: boolean; data: { conversation: Conversation } }> {
    return this.request(`/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async markConversationAsRead(id: string, messageIds?: string[]): Promise<{
    success: boolean;
    data: {
      markedCount: number;
      conversation: { id: string; unreadCount: number }
    }
  }> {
    return this.request(`/conversations/${id}/mark-as-read`, {
      method: 'POST',
      body: JSON.stringify({ messageIds })
    });
  }

  // ==================== Messages ====================

  async getMessages(conversationId: string, params?: {
    limit?: number;
    before?: string;
  }): Promise<{ success: boolean; data: { messages: any[]; hasMore: boolean } }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/conversations/${conversationId}/messages${query ? '?' + query : ''}`);
  }

  async sendMessage(conversationId: string, data: {
    type: 'outgoing';
    content: {
      text: string;
      contentType: string;
    };
  }): Promise<{ success: boolean; data: { message: any } }> {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMessageStatus(messageId: string, status: string): Promise<{ success: boolean }> {
    return this.request(`/messages/${messageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ==================== End Users ====================

  async getEndUsers(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ data: EndUser[]; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/end-users${query ? '?' + query : ''}`);
  }

  async getEndUser(id: string): Promise<{ success: boolean; data: { contact: EndUser } }> {
    return this.request(`/end-users/${id}`);
  }

  async createEndUser(data: {
    name: string;
    channel: string;
    metadata?: {
      phoneNumber?: string;
      email?: string;
    };
  }): Promise<{ success: boolean; data: { contact: EndUser } }> {
    return this.request('/end-users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateEndUser(id: string, data: {
    name?: string;
    metadata?: any;
  }): Promise<{ success: boolean; data: { contact: EndUser } }> {
    return this.request(`/end-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // ==================== Team ====================

  async getTeamMembers(): Promise<{ success: boolean; data: { members: TeamMember[] } }> {
    return this.request('/team');
  }

  async inviteTeamMember(data: {
    email: string;
    name: string;
    role: 'admin' | 'agent';
  }): Promise<{ success: boolean; data: { invite: any } }> {
    return this.request('/team/invites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async removeTeamMember(memberId: string): Promise<{ success: boolean; data: { memberId: string } }> {
    return this.request(`/team/members/${memberId}`, {
      method: 'DELETE'
    });
  }

  async updateTeamMember(memberId: string, data: {
    role: 'admin' | 'agent';
  }): Promise<{ success: boolean; data: { member: TeamMember } }> {
    return this.request(`/team/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // ==================== Account ====================

  async getAccount(): Promise<{ success: boolean; data: { user: User; tenant: any } }> {
    return this.request('/account');
  }

  async updateAccount(data: {
    name?: string;
    timezone?: string;
  }): Promise<{ success: boolean; data: { user: User } }> {
    return this.request('/account', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // ==================== Integrations ====================

  async getIntegrations(): Promise<{ success: boolean; data: { integrations: Integration[] } }> {
    return this.request('/integrations');
  }

  async connectIntegration(type: string, data: {
    credentials: any;
    config?: any;
  }): Promise<{ success: boolean; data: { integration: Integration } }> {
    return this.request(`/integrations/${type}/connect`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async disconnectIntegration(integrationId: string): Promise<{ success: boolean; data: { integrationId: string } }> {
    return this.request(`/integrations/${integrationId}`, {
      method: 'DELETE'
    });
  }

  // ==================== Mentions ====================

  async getMentions(params?: {
    status?: 'all' | 'read' | 'unread';
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    data: {
      mentions: Mention[];
      pagination: {
        limit: number;
        offset: number;
        total: number;
      };
    };
  }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/mentions${query ? '?' + query : ''}`);
  }

  async getMentionsUnreadCount(): Promise<{ success: boolean; data: { unreadCount: number } }> {
    return this.request('/mentions/unread-count');
  }

  async getMention(id: string): Promise<{ success: boolean; data: Mention }> {
    return this.request(`/mentions/${id}`);
  }

  async markMentionAsRead(id: string): Promise<{
    success: boolean;
    data: {
      id: string;
      isRead: boolean;
      message: string;
    };
  }> {
    return this.request(`/mentions/${id}/mark-as-read`, {
      method: 'POST'
    });
  }

  async markAllMentionsAsRead(): Promise<{
    success: boolean;
    data: {
      markedCount: number;
      message: string;
    };
  }> {
    return this.request('/mentions/mark-all-read', {
      method: 'POST'
    });
  }

  // ==================== Message Feedback ====================

  async createOrUpdateMessageFeedback(
    messageId: string,
    data: {
      rating?: 'positive' | 'negative';
      comment?: string;
      suggestedCorrection?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      feedback: MessageFeedback;
      message: string;
    };
  }> {
    return this.request(`/messages/${messageId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMessageFeedback(messageId: string): Promise<{
    success: boolean;
    data: {
      feedback: MessageFeedback[];
    };
  }> {
    return this.request(`/messages/${messageId}/feedback`);
  }

  async getAllFeedback(params?: {
    extensionId?: string;
    rating?: 'positive' | 'negative' | 'none' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    data: {
      feedback: Array<MessageFeedback & {
        message: {
          id: string;
          type: string;
          text: string;
          conversationId: string;
          endUser: {
            id: string;
            name: string;
            externalId: string;
          };
          createdAt: string;
        };
      }>;
      pagination: {
        limit: number;
        offset: number;
      };
    };
  }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/feedback${query ? '?' + query : ''}`);
  }

  async getFeedbackAnalytics(params?: {
    extensionId?: string;
    days?: number;
  }): Promise<{
    success: boolean;
    data: FeedbackAnalytics;
  }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/feedback/analytics${query ? '?' + query : ''}`);
  }
}

export const adminAPI = new AdminAPIClient();
