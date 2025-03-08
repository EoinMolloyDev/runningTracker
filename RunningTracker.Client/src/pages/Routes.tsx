import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RunningRoute, routesApi } from '../services/api';

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<RunningRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await routesApi.getAll();
        setRoutes(response.data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Running Routes</h1>
        <Link to="/routes/new">
          <Button variant="success">Add New Route</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading routes...</p>
      ) : routes.length === 0 ? (
        <p>No routes found. Create your first route!</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Distance (km)</th>
              <th>Start Location</th>
              <th>Loop</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id}>
                <td>{route.name}</td>
                <td>{route.distance}</td>
                <td>{route.startLocation || 'N/A'}</td>
                <td>{route.isLoop ? 'Yes' : 'No'}</td>
                <td>
                  <Link to={`/routes/${route.id}`}>
                    <Button variant="primary" size="sm" className="me-2">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default RoutesPage; 