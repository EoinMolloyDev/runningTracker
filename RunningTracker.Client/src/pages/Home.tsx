import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home: React.FC = () => {
  return (
    <>
      <div className="banner">
        <div className="banner-overlay">
          <h1 className="banner-title">Fitness Journey</h1>
          <p className="banner-subtitle">Track, Analyze, and Improve Your Running Performance</p>
        </div>
      </div>
      
      <Container className="mt-5">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">Welcome to Running Tracker</h2>
            <p className="text-center lead">
              Track your running activities, create routes, and analyze your performance.
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

        <Row className="mt-4">
          <Col>
            <Card className="text-center p-4">
              <Card.Body>
                <Card.Title>Start Your Fitness Journey Today</Card.Title>
                <Card.Text>
                  Whether you're a beginner or an experienced runner, our app helps you track your progress and achieve your fitness goals.
                </Card.Text>
                <Link to="/activities/new">
                  <Button variant="primary" size="lg">Get Started</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home; 