import axios from 'axios';

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

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api; 