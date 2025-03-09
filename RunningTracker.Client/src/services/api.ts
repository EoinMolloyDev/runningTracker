import axios from 'axios';
import authService from './authService';

const API_URL = 'https://localhost:7110/api';

// Define interfaces for our models
export interface RunningActivity {
  id?: number;
  date: string;
  distance: number;
  duration: number;
  pace?: number;
  speed?: number;
  notes?: string;
  weatherConditions?: string;
  temperature?: number;
  userId?: number;
  routeId?: number;
}

export interface RunningRoute {
  id?: number;
  name: string;
  description?: string;
  distance: number;
  startLocation?: string;
  endLocation?: string;
  isLoop: boolean;
  routeData?: string;
  elevationGain?: number;
  elevationLoss?: number;
  userId?: number;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  weight?: number;
  height?: number;
  dateOfBirth?: string;
  profilePictureUrl?: string;
}

export interface Goal {
  id?: number;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  goalType: GoalType;
  timeframe: GoalTimeframe;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  userId?: number;
}

export interface CreateGoalDTO {
  name: string;
  description?: string;
  targetValue: number;
  goalType: GoalType;
  timeframe: GoalTimeframe;
  startDate: string;
  endDate: string;
}

export enum GoalType {
  TotalDistance = 'TotalDistance',
  TotalActivities = 'TotalActivities',
  AveragePace = 'AveragePace',
  LongestRun = 'LongestRun',
  FastestPace = 'FastestPace'
}

export enum GoalTimeframe {
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Custom = 'Custom'
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    console.error('API Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Unauthorized, clear user data and redirect to login
        authService.logout();
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// Activities API
export const activitiesApi = {
  getAll: () => api.get<RunningActivity[]>('/runningactivities'),
  getById: (id: number) => api.get<RunningActivity>(`/runningactivities/${id}`),
  create: (activity: RunningActivity) => api.post<RunningActivity>('/runningactivities', activity),
  update: (id: number, activity: RunningActivity) => api.put<void>(`/runningactivities/${id}`, activity),
  delete: (id: number) => api.delete<void>(`/runningactivities/${id}`),
};

// Routes API
export const routesApi = {
  getAll: () => api.get<RunningRoute[]>('/routes'),
  getById: (id: number) => api.get<RunningRoute>(`/routes/${id}`),
  create: (route: RunningRoute) => api.post<RunningRoute>('/routes', route),
  update: (id: number, route: RunningRoute) => api.put<void>(`/routes/${id}`, route),
  delete: (id: number) => api.delete<void>(`/routes/${id}`),
  getByUserId: (userId: number) => api.get<RunningRoute[]>(`/routes/user/${userId}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: User) => api.post<User>('/users', user),
  update: (id: number, user: User) => api.put<void>(`/users/${id}`, user),
  delete: (id: number) => api.delete<void>(`/users/${id}`),
  getUserActivities: (id: number) => api.get<RunningActivity[]>(`/users/${id}/runningactivities`),
};

// Goals API
export const goalsApi = {
  getAll: () => api.get<Goal[]>('/goals'),
  getById: (id: number) => api.get<Goal>(`/goals/${id}`),
  create: (goal: any) => {
    // Ensure the data is in the correct format
    const formattedGoal = {
      name: goal.name,
      description: goal.description || '',
      targetValue: Number(goal.targetValue),
      goalType: goal.goalType,
      timeframe: goal.timeframe,
      startDate: goal.startDate,
      endDate: goal.endDate
    };
    
    console.log('API sending goal data:', formattedGoal);
    return api.post<Goal>('/goals', formattedGoal);
  },
  update: (id: number, goal: Goal) => api.put<void>(`/goals/${id}`, goal),
  delete: (id: number) => api.delete<void>(`/goals/${id}`),
  getByUserId: (userId: number) => api.get<Goal[]>(`/goals/user/${userId}`),
  updateProgress: (id: number, currentValue: number) => api.put<void>(`/goals/${id}/progress`, currentValue),
  updateAllProgress: () => api.put<void>('/goals/updateProgress'),
};

export default api; 