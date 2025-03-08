import React from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Activities from './pages/Activities';
import ActivityForm from './pages/ActivityForm';
import RoutesPage from './pages/Routes';
import RouteForm from './pages/RouteForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <RouterRoutes>
            <Route path="/" element={<Home />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/new" element={<ActivityForm />} />
            <Route path="/activities/:id" element={<ActivityForm />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/new" element={<RouteForm />} />
            <Route path="/routes/:id" element={<RouteForm />} />
          </RouterRoutes>
        </div>
      </div>
    </Router>
  );
}

export default App; 