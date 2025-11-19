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
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface Conversation {
  id: string;
  endUserId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  channel: string;
  status: 'active' | 'closed';
}

export interface EndUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  lastContactAt?: string;
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

  // ==================== Conversations ====================

  async getConversations(params?: {
    limit?: number;
    offset?: number;
    status?: 'active' | 'closed';
  }): Promise<{ data: Conversation[]; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/conversations${query ? '?' + query : ''}`);
  }

  async getConversation(id: string): Promise<{ data: Conversation }> {
    return this.request(`/conversations/${id}`);
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

  async getEndUser(id: string): Promise<{ data: EndUser }> {
    return this.request(`/end-users/${id}`);
  }

  // ==================== Team ====================

  async getTeamMembers(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ data: User[]; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/team${query ? '?' + query : ''}`);
  }

  async inviteTeamMember(data: {
    email: string;
    name: string;
    role: string;
  }): Promise<{ success: boolean }> {
    return this.request('/team/invite', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const adminAPI = new AdminAPIClient();
