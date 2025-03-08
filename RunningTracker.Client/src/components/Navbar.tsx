import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import authService, { AUTH_STATE_CHANGE_EVENT } from '../services/authService';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status whenever location changes or component mounts
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

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="main-navbar">
      <Container>
        <Link to="/" className="navbar-brand-link">
          <BootstrapNavbar.Brand>
            <span className="brand-text">Fitness Journey</span>
          </BootstrapNavbar.Brand>
        </Link>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link to="/" className="nav-link">Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/activities" className="nav-link">Activities</Link>
                <Link to="/routes" className="nav-link">Routes</Link>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="dark" id="dropdown-user" className="nav-user-dropdown">
                    {username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">
                  <Button variant="outline-light" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 