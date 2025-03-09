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

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Unauthorized, clear user data and redirect to login
      authService.logout();
      window.location.href = '/login';
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

// Goals API (client-side only for now)
export const goalsApi = {
  getAll: () => {
    // Get goals from localStorage or return empty array
    const goals = localStorage.getItem('running_goals');
    return Promise.resolve({ data: goals ? JSON.parse(goals) : [] });
  },
  
  getById: (id: number) => {
    const goals = localStorage.getItem('running_goals');
    const parsedGoals: Goal[] = goals ? JSON.parse(goals) : [];
    const goal = parsedGoals.find(g => g.id === id);
    return Promise.resolve({ data: goal });
  },
  
  create: (goal: Goal) => {
    const goals = localStorage.getItem('running_goals');
    const parsedGoals: Goal[] = goals ? JSON.parse(goals) : [];
    
    // Generate a new ID
    const newId = parsedGoals.length > 0 
      ? Math.max(...parsedGoals.map(g => g.id || 0)) + 1 
      : 1;
    
    const newGoal = { ...goal, id: newId };
    parsedGoals.push(newGoal);
    
    localStorage.setItem('running_goals', JSON.stringify(parsedGoals));
    return Promise.resolve({ data: newGoal });
  },
  
  update: (id: number, goal: Goal) => {
    const goals = localStorage.getItem('running_goals');
    const parsedGoals: Goal[] = goals ? JSON.parse(goals) : [];
    
    const index = parsedGoals.findIndex(g => g.id === id);
    if (index !== -1) {
      parsedGoals[index] = { ...goal, id };
      localStorage.setItem('running_goals', JSON.stringify(parsedGoals));
    }
    
    return Promise.resolve({ data: null });
  },
  
  delete: (id: number) => {
    const goals = localStorage.getItem('running_goals');
    const parsedGoals: Goal[] = goals ? JSON.parse(goals) : [];
    
    const filteredGoals = parsedGoals.filter(g => g.id !== id);
    localStorage.setItem('running_goals', JSON.stringify(filteredGoals));
    
    return Promise.resolve({ data: null });
  },
  
  updateProgress: (activities: RunningActivity[]) => {
    const goals = localStorage.getItem('running_goals');
    const parsedGoals: Goal[] = goals ? JSON.parse(goals) : [];
    
    if (parsedGoals.length === 0 || activities.length === 0) {
      return Promise.resolve({ data: parsedGoals });
    }
    
    const updatedGoals = parsedGoals.map(goal => {
      // Filter activities within the goal's timeframe
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      const relevantActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startDate && activityDate <= endDate;
      });
      
      let currentValue = 0;
      
      // Calculate current value based on goal type
      switch (goal.goalType) {
        case GoalType.TotalDistance:
          currentValue = relevantActivities.reduce((sum, activity) => 
            sum + (typeof activity.distance === 'number' ? activity.distance : 0), 0);
          break;
          
        case GoalType.TotalActivities:
          currentValue = relevantActivities.length;
          break;
          
        case GoalType.AveragePace:
          if (relevantActivities.length > 0) {
            const totalDistance = relevantActivities.reduce((sum, activity) => 
              sum + (typeof activity.distance === 'number' ? activity.distance : 0), 0);
            const totalDuration = relevantActivities.reduce((sum, activity) => 
              sum + (typeof activity.duration === 'number' ? activity.duration : 0), 0);
            currentValue = totalDistance > 0 ? totalDuration / 60 / totalDistance : 0;
          }
          break;
          
        case GoalType.LongestRun:
          if (relevantActivities.length > 0) {
            const distances = relevantActivities
              .filter(a => typeof a.distance === 'number')
              .map(a => a.distance);
            currentValue = distances.length > 0 ? Math.max(...distances) : 0;
          }
          break;
          
        case GoalType.FastestPace:
          const paces = relevantActivities
            .filter(a => a.pace && typeof a.pace === 'number' && a.pace > 0)
            .map(a => a.pace as number);
          currentValue = paces.length > 0 ? Math.min(...paces) : 0;
          break;
      }
      
      // Check if goal is completed
      const isCompleted = goal.goalType === GoalType.AveragePace || goal.goalType === GoalType.FastestPace
        ? currentValue <= goal.targetValue && currentValue > 0 // Lower is better for pace
        : currentValue >= goal.targetValue;
      
      return { ...goal, currentValue, isCompleted };
    });
    
    localStorage.setItem('running_goals', JSON.stringify(updatedGoals));
    return Promise.resolve({ data: updatedGoals });
  }
};

export default api; 