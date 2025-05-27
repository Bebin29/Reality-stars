import { useSession } from '@supabase/auth-helpers-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Types matching the backend
export interface Personality {
  personality_id: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  gender?: 'männlich' | 'weiblich' | 'divers';
  bio?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PersonalityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: 'männlich' | 'weiblich' | 'divers';
  nationality?: string;
  sort_by?: 'first_name' | 'last_name' | 'birth_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface CreatePersonalityRequest {
  first_name: string;
  last_name: string;
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  gender?: 'männlich' | 'weiblich' | 'divers';
  bio?: string;
  profile_image?: string;
}

class ApiService {
  private getAuthHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Personalities API
  async getPersonalities(params: PersonalityQueryParams = {}): Promise<PaginatedResponse<Personality[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/personalities?${searchParams}`);
    return this.handleResponse<PaginatedResponse<Personality[]>>(response);
  }

  async getPersonalityById(id: string): Promise<ApiResponse<Personality>> {
    const response = await fetch(`${API_BASE_URL}/personalities/${id}`);
    return this.handleResponse<ApiResponse<Personality>>(response);
  }

  async searchPersonalities(searchTerm: string, limit: number = 10): Promise<ApiResponse<Personality[]>> {
    const response = await fetch(`${API_BASE_URL}/personalities/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`);
    return this.handleResponse<ApiResponse<Personality[]>>(response);
  }

  async createPersonality(data: CreatePersonalityRequest, accessToken: string): Promise<ApiResponse<Personality>> {
    const response = await fetch(`${API_BASE_URL}/personalities`, {
      method: 'POST',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Personality>>(response);
  }

  async updatePersonality(id: string, data: Partial<CreatePersonalityRequest>, accessToken: string): Promise<ApiResponse<Personality>> {
    const response = await fetch(`${API_BASE_URL}/personalities/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(accessToken),
      body: JSON.stringify(data),
    });
    return this.handleResponse<ApiResponse<Personality>>(response);
  }

  async deletePersonality(id: string, accessToken: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/personalities/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(accessToken),
    });
    return this.handleResponse<ApiResponse<null>>(response);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const healthUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:3001';
    const response = await fetch(`${healthUrl}/health`);
    return this.handleResponse<ApiResponse>(response);
  }
}

export const apiService = new ApiService();

// React Hook for API calls with authentication
export const useApiWithAuth = () => {
  const session = useSession();
  
  const callWithAuth = async <T>(
    apiCall: (accessToken: string) => Promise<T>
  ): Promise<T> => {
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return apiCall(session.access_token);
  };

  return { callWithAuth, isAuthenticated: !!session };
}; 