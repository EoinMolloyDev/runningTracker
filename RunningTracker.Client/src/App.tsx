import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Activities from './pages/Activities';
import ActivityForm from './pages/ActivityForm';
import RoutesPage from './pages/Routes';
import RouteForm from './pages/RouteForm';
import Login from './pages/Login';
import Register from './pages/Register';
import authService, { AUTH_STATE_CHANGE_EVENT } from './services/authService';

// Protected route wrapper component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
    };
    
    checkAuth();
    
    // Check authentication status when localStorage changes
    window.addEventListener('storage', checkAuth);
    // Listen for auth state changes
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <RouterRoutes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          } />
          
          {/* Home page is accessible to all, but shows different content based on auth status */}
          <Route path="/" element={<Home />} />
          
          {/* Protected routes */}
          <Route path="/activities" element={
            <RequireAuth>
              <Activities />
            </RequireAuth>
          } />
          <Route path="/activities/new" element={
            <RequireAuth>
              <ActivityForm />
            </RequireAuth>
          } />
          <Route path="/activities/:id" element={
            <RequireAuth>
              <ActivityForm />
            </RequireAuth>
          } />
          <Route path="/routes" element={
            <RequireAuth>
              <RoutesPage />
            </RequireAuth>
          } />
          <Route path="/routes/new" element={
            <RequireAuth>
              <RouteForm />
            </RequireAuth>
          } />
          <Route path="/routes/:id" element={
            <RequireAuth>
              <RouteForm />
            </RequireAuth>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </RouterRoutes>
      </div>
    </Router>
  );
}

export default App; 