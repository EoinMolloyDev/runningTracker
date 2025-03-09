import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { RunningActivity, activitiesApi } from '../services/api';

// Weather condition options
const WEATHER_CONDITIONS = ['Normal', 'Cold', 'Warm', 'Very Warm'];

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

  // Separate state for minutes and seconds
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

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
          
          // Calculate minutes and seconds from total seconds
          const totalSeconds = formattedActivity.duration;
          setDurationMinutes(Math.floor(totalSeconds / 60));
          setDurationSeconds(totalSeconds % 60);
        } catch (error) {
          console.error('Error fetching activity:', error);
        }
      };
      fetchActivity();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle duration changes (minutes and seconds)
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    if (name === 'durationMinutes') {
      setDurationMinutes(numValue);
      // Update the total duration in seconds
      setActivity(prev => ({
        ...prev,
        duration: numValue * 60 + durationSeconds
      }));
    } else if (name === 'durationSeconds') {
      // Ensure seconds are between 0-59
      const validSeconds = Math.min(Math.max(numValue, 0), 59);
      setDurationSeconds(validSeconds);
      // Update the total duration in seconds
      setActivity(prev => ({
        ...prev,
        duration: durationMinutes * 60 + validSeconds
      }));
    }
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
              <Form.Label>Duration</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    min="0"
                    name="durationMinutes"
                    value={durationMinutes}
                    onChange={handleDurationChange}
                    placeholder="Minutes"
                    required
                  />
                  <Form.Text className="text-muted">Minutes</Form.Text>
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    min="0"
                    max="59"
                    name="durationSeconds"
                    value={durationSeconds}
                    onChange={handleDurationChange}
                    placeholder="Seconds"
                    required
                  />
                  <Form.Text className="text-muted">Seconds</Form.Text>
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weather Conditions</Form.Label>
              <Form.Select
                name="weatherConditions"
                value={activity.weatherConditions || ''}
                onChange={handleChange}
              >
                <option value="">Select weather condition</option>
                {WEATHER_CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </Form.Select>
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