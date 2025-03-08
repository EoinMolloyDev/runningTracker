import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { RunningActivity, activitiesApi } from '../services/api';

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
        <h1>Running Activities</h1>
        <Link to="/activities/new">
          <Button variant="success">Add New Activity</Button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map(activity => (
              <tr key={activity.id}>
                <td>{new Date(activity.date).toLocaleDateString()}</td>
                <td>{activity.distance}</td>
                <td>{Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}</td>
                <td>{activity.pace || 'N/A'}</td>
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

export default Activities; 