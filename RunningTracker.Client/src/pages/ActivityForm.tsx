import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { RunningActivity, activitiesApi } from '../services/api';

const ActivityForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [activity, setActivity] = useState<RunningActivity>({
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    duration: 0,
    notes: ''
  });

  useEffect(() => {
    if (isEditing) {
      const fetchActivity = async () => {
        try {
          const response = await activitiesApi.getById(parseInt(id));
          // Format date for the input field
          const formattedActivity = {
            ...response.data,
            date: new Date(response.data.date).toISOString().split('T')[0]
          };
          setActivity(formattedActivity);
        } catch (error) {
          console.error('Error fetching activity:', error);
        }
      };
      fetchActivity();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await activitiesApi.update(parseInt(id), activity);
      } else {
        await activitiesApi.create(activity);
      }
      navigate('/activities');
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header>
          <h2>{isEditing ? 'Edit Activity' : 'Log New Activity'}</h2>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={activity.date}
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
                value={activity.distance}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (seconds)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={activity.duration}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weather Conditions</Form.Label>
              <Form.Control
                type="text"
                name="weatherConditions"
                value={activity.weatherConditions || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Temperature (°C)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                name="temperature"
                value={activity.temperature || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={activity.notes || ''}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate('/activities')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? 'Update' : 'Save'} Activity
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityForm; 