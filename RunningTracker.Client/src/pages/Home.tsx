import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import authService, { AUTH_STATE_CHANGE_EVENT } from '../services/authService';
import '../styles/Home.css';

const Home: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const auth = authService.isAuthenticated();
      setIsAuthenticated(auth);
      
      if (auth) {
        const user = authService.getCurrentUser();
        if (user) {
          setUsername(user.username);
        }
      }
    };
    
    checkAuth();
    
    // Check authentication status when the component mounts and when the storage changes
    window.addEventListener('storage', checkAuth);
    // Listen for auth state changes
    window.addEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGE_EVENT, checkAuth);
    };
  }, [location.pathname]); // Re-check when route changes

  return (
    <>
      <div className="banner">
        <div className="banner-overlay">
          <h1 className="banner-title">Fitness Path</h1>
          <p className="banner-subtitle">Track, Analyze, and Improve Your Running Performance</p>
          {!isAuthenticated && (
            <div className="mt-4">
              <Link to="/login">
                <Button variant="primary" className="me-3">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="light">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Container className="mt-5">
        {isAuthenticated ? (
          <>
            <Row className="mb-4">
              <Col>
                <h2 className="text-center">Welcome back, {username}!</h2>
                <p className="text-center lead">
                  Continue tracking your running progress and achieving your fitness goals.
                </p>
              </Col>
            </Row>
            
            <Row>
              <Col md={6} className="mb-4">
                <Card className="feature-card">
                  <Card.Body>
                    <Card.Title>Activities</Card.Title>
                    <Card.Text>
                      Track your running activities including distance, time, pace, and more.
                    </Card.Text>
                    <Link to="/activities">
                      <Button variant="primary">View Activities</Button>
                    </Link>
                    {' '}
                    <Link to="/activities/new">
                      <Button variant="success">Add New Activity</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} className="mb-4">
                <Card className="feature-card">
                  <Card.Body>
                    <Card.Title>Routes</Card.Title>
                    <Card.Text>
                      Create and manage your running routes to reuse in your activities.
                    </Card.Text>
                    <Link to="/routes">
                      <Button variant="primary">View Routes</Button>
                    </Link>
                    {' '}
                    <Link to="/routes/new">
                      <Button variant="success">Add New Route</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row className="mb-4">
              <Col>
                <h2 className="text-center">Welcome to Running Tracker</h2>
                <p className="text-center lead">
                  Track your running activities, create routes, and analyze your performance.
                </p>
              </Col>
            </Row>
            
            <Row>
              <Col md={4} className="mb-4">
                <Card className="feature-card text-center">
                  <Card.Body>
                    <div className="feature-icon mb-3">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <Card.Title>Track Progress</Card.Title>
                    <Card.Text>
                      Log your runs and monitor your improvement over time with detailed statistics.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-4">
                <Card className="feature-card text-center">
                  <Card.Body>
                    <div className="feature-icon mb-3">
                      <i className="bi bi-map"></i>
                    </div>
                    <Card.Title>Create Routes</Card.Title>
                    <Card.Text>
                      Design and save your favorite running routes to use for future activities.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} className="mb-4">
                <Card className="feature-card text-center">
                  <Card.Body>
                    <div className="feature-icon mb-3">
                      <i className="bi bi-trophy"></i>
                    </div>
                    <Card.Title>Set Goals</Card.Title>
                    <Card.Text>
                      Define personal targets and track your achievements to stay motivated.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mt-4">
              <Col>
                <Card className="text-center p-4">
                  <Card.Body>
                    <Card.Title>Start Your Fitness Journey Today</Card.Title>
                    <Card.Text>
                      Whether you're a beginner or an experienced runner, our app helps you track your progress and achieve your fitness goals.
                    </Card.Text>
                    <Link to="/register">
                      <Button variant="primary" size="lg">Get Started</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default Home; 