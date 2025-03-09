import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RunningActivity, activitiesApi } from '../services/api';
import { formatDuration, formatPace } from '../utils/formatters';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<RunningActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await activitiesApi.getAll();
        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Running tracking</h1>
        <Link to="/activities/new">
          <Button variant="success">Add Activity</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading activities...</p>
      ) : activities.length === 0 ? (
        <p>No activities found. Start tracking your runs!</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Distance (km)</th>
              <th>Duration</th>
              <th>Pace (min/km)</th>
              <th>Weather</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity => (
              <tr key={activity.id}>
                <td>{new Date(activity.date).toLocaleDateString()}</td>
                <td>{activity.distance.toFixed(2)}</td>
                <td>{formatDuration(activity.duration)}</td>
                <td>{formatPace(activity.pace)}</td>
                <td>
                  {activity.weatherConditions ? (
                    <Badge bg={getWeatherBadgeColor(activity.weatherConditions)}>
                      {activity.weatherConditions}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <Link to={`/activities/${activity.id}`}>
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

// Helper function to determine badge color based on weather condition
const getWeatherBadgeColor = (weatherCondition: string): string => {
  switch (weatherCondition) {
    case 'Cold':
      return 'info';
    case 'Normal':
      return 'success';
    case 'Warm':
      return 'warning';
    case 'Very Warm':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default Activities; 