import axios from 'axios';

const API_URL = 'https://localhost:7110/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  expiresAt: string;
}

// Custom event for auth state changes
export const AUTH_STATE_CHANGE_EVENT = 'auth-state-change';

class AuthService {
  login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      this.notifyAuthStateChange();
    }
    return response.data;
  };

  register = async (user: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/register`, user);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      this.notifyAuthStateChange();
    }
    return response.data;
  };

  logout = (): void => {
    localStorage.removeItem('user');
    this.notifyAuthStateChange();
  };

  getCurrentUser = (): AuthResponse | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  };

  isAuthenticated = (): boolean => {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    
    // Check if token is expired
    const expiresAt = new Date(user.expiresAt).getTime();
    const now = new Date().getTime();
    
    if (now > expiresAt) {
      this.logout(); // Token expired, logout user
      return false;
    }
    
    return true;
  };

  getAuthHeader = (): { Authorization: string } | {} => {
    const user = this.getCurrentUser();
    if (user && user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    return {};
  };

  // Notify all components that auth state has changed
  notifyAuthStateChange = (): void => {
    window.dispatchEvent(new Event(AUTH_STATE_CHANGE_EVENT));
  };
}

export default new AuthService(); 