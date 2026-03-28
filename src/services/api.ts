// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ================ TYPES ================ #

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

// ================ HELPERS ================ #

/**
 * Helper for common API fetch operations
 * Handles JSON serialization and error parsing
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.detail || `API error: ${response.statusText}`);
  }

  return response.json();
}

// ================ API ENDPOINTS ================ #

export const api = {
  async login(data: LoginData): Promise<TokenResponse> {
    return apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: data.email,
        password: data.password,
      }),
    });
  },

  async register(data: RegisterData): Promise<TokenResponse> {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async generatePost(data: { topic: string; platform: string; tone: string }, token: string) {
    const doRequest = async (accessToken: string) => {
      return fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
    };

    let response = await doRequest(token);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Unauthorized - no refresh token available');
      }

      const tokenResponse = await this.refreshToken(refreshToken);
      localStorage.setItem('token', tokenResponse.access_token);
      response = await doRequest(tokenResponse.access_token);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Generation failed');
    }

    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async getMe(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('unauthorized');
      }
      throw new Error('Failed to get user');
    }

    return response.json();
  },
};