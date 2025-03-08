import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { RunningRoute, routesApi } from '../services/api';

const RouteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [route, setRoute] = useState<RunningRoute>({
    name: '',
    distance: 0,
    isLoop: false,
    description: ''
  });

  useEffect(() => {
    if (isEditing) {
      const fetchRoute = async () => {
        try {
          const response = await routesApi.getById(parseInt(id));
          setRoute(response.data);
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };
      fetchRoute();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRoute(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await routesApi.update(parseInt(id), route);
      } else {
        await routesApi.create(route);
      }
      navigate('/routes');
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>{isEditing ? 'Edit Route' : 'Create New Route'}</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Route Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={route.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Distance (km)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="distance"
                value={route.distance}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={route.description || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Location</Form.Label>
              <Form.Control
                type="text"
                name="startLocation"
                value={route.startLocation || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Location</Form.Label>
              <Form.Control
                type="text"
                name="endLocation"
                value={route.endLocation || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is this a loop? (Ends where it starts)"
                name="isLoop"
                checked={route.isLoop}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/routes')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Create'} Route
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RouteForm; 