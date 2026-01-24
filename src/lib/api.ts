const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  // Auth
  async register(email: string, password: string) {
    const response = await this.request<{ user: unknown; token: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: unknown; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    const response = await this.request('/api/auth/logout', { method: 'POST' });
    this.setToken(null);
    return response;
  }

  async getMe() {
    return this.request<{ user: unknown }>('/api/auth/me');
  }

  // Hubs
  async getHubs() {
    return this.request<{ hubs: unknown[] }>('/api/hubs');
  }

  async getHub(id: string) {
    return this.request<{ hub: unknown }>(`/api/hubs/${id}`);
  }

  async createHub(data: { slug: string; title: string; description?: string; theme?: string }) {
    return this.request<{ hub: unknown }>('/api/hubs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHub(id: string, data: Record<string, unknown>) {
    return this.request<{ hub: unknown }>(`/api/hubs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHub(id: string) {
    return this.request(`/api/hubs/${id}`, { method: 'DELETE' });
  }

  // Links
  async getLinks(hubId: string) {
    return this.request<{ links: unknown[] }>(`/api/hubs/${hubId}/links`);
  }

  async createLink(hubId: string, data: { title: string; url: string; icon?: string }) {
    return this.request<{ link: unknown }>(`/api/hubs/${hubId}/links`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLink(linkId: string, data: Record<string, unknown>) {
    return this.request<{ link: unknown }>(`/api/links/${linkId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLink(linkId: string) {
    return this.request(`/api/links/${linkId}`, { method: 'DELETE' });
  }

  async reorderLinks(hubId: string, linkIds: string[]) {
    return this.request<{ links: unknown[] }>(`/api/hubs/${hubId}/links/reorder`, {
      method: 'POST',
      body: JSON.stringify({ linkIds }),
    });
  }

  // Rules
  async getRules(hubId: string) {
    return this.request<{ rules: unknown[] }>(`/api/hubs/${hubId}/rules`);
  }

  async createRule(hubId: string, data: Record<string, unknown>) {
    return this.request<{ rule: unknown }>(`/api/hubs/${hubId}/rules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRule(ruleId: string, data: Record<string, unknown>) {
    return this.request<{ rule: unknown }>(`/api/rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRule(ruleId: string) {
    return this.request(`/api/rules/${ruleId}`, { method: 'DELETE' });
  }

  // Rules Preview
  async previewRules(hubId: string, context: {
    hour: number;
    dayOfWeek: number;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    country?: string;
  }) {
    return this.request<{
      links: { id: string; title: string; url: string; icon: string | null; score: number; baseOrder: number }[];
      explanation: unknown;
    }>(`/api/hubs/${hubId}/rules/preview`, {
      method: 'POST',
      body: JSON.stringify({ context }),
    });
  }

  // Magic Rule - Generate rule from natural language
  async generateRuleFromPrompt(hubId: string, prompt: string) {
    return this.request<{
      rule: Record<string, unknown>;
      confidence: number;
      message: string;
    }>(`/api/hubs/${hubId}/rules/generate-from-prompt`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Analytics
  async getAnalytics(hubId: string, days: number = 7) {
    return this.request<{ summary: unknown }>(`/api/hubs/${hubId}/analytics/summary?days=${days}`);
  }

  async getAnalyticsTimeseries(hubId: string, window: '7d' | '30d' = '7d') {
    return this.request<{
      timeseries: {
        window: string;
        data: { date: string; visits: number; clicks: number }[];
        totalVisits: number;
        totalClicks: number;
        overallCtr: number;
      };
    }>(`/api/hubs/${hubId}/analytics/timeseries?window=${window}`);
  }

  async getLinkAnalytics(hubId: string, window: '7d' | '30d' = '7d') {
    return this.request<{
      linkAnalytics: {
        hubId: string;
        window: string;
        totalVisits: number;
        links: {
          linkId: string;
          title: string;
          clicks: number;
          ctr: number;
          rank: number;
          trend: 'up' | 'down' | 'stable';
          previousClicks: number;
        }[];
      };
    }>(`/api/hubs/${hubId}/analytics/links?window=${window}`);
  }

  getExportUrl(hubId: string, days: number = 30): string {
    const token = this.getToken();
    return `${this.baseUrl}/api/hubs/${hubId}/analytics/export?days=${days}&token=${token}`;
  }

  // Public
  async getPublicHub(slug: string) {
    return this.request<{
      hub: { id: string; slug: string; title: string; description: string | null; theme: string };
      links: { id: string; title: string; url: string; icon: string | null }[];
    }>(`/api/public/h/${slug}`);
  }

  // Improved click tracking using sendBeacon for reliability
  recordClickBeacon(linkId: string): void {
    const url = `${this.baseUrl}/api/public/link/${linkId}/click`;
    const data = JSON.stringify({});
    
    // Try sendBeacon first (most reliable for navigation)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    
    // Fallback to fetch with keepalive
    fetch(url, {
      method: 'POST',
      body: data,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  }

  async recordClick(linkId: string) {
    return this.request<{ url: string }>(`/api/public/link/${linkId}/click`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_BASE);
export default api;
