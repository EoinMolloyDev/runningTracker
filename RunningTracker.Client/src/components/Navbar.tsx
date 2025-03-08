import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
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
            <Link to="/activities" className="nav-link">Activities</Link>
            <Link to="/routes" className="nav-link">Routes</Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 