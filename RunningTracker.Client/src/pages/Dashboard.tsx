import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner } from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, parseISO, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { RunningActivity, activitiesApi } from '../services/api';
import '../styles/Dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [activities, setActivities] = useState<RunningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalDistance: 0,
    totalDuration: 0,
    averagePace: 0,
    averageSpeed: 0,
    longestRun: 0,
    fastestPace: 0,
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await activitiesApi.getAll();
        const activitiesData = response.data;
        setActivities(activitiesData);
        
        // Calculate stats
        if (activitiesData.length > 0) {
          const totalDistance = activitiesData.reduce((sum, activity) => sum + activity.distance, 0);
          const totalDuration = activitiesData.reduce((sum, activity) => sum + activity.duration, 0);
          const averagePace = totalDuration / 60 / totalDistance;
          const averageSpeed = totalDistance / (totalDuration / 3600);
          const longestRun = Math.max(...activitiesData.map(a => a.distance));
          
          // Find fastest pace (lowest value is fastest)
          const paces = activitiesData
            .filter(a => a.pace && a.pace > 0)
            .map(a => a.pace as number);
          const fastestPace = paces.length > 0 ? Math.min(...paces) : 0;
          
          setStats({
            totalActivities: activitiesData.length,
            totalDistance: parseFloat(totalDistance.toFixed(2)),
            totalDuration: totalDuration,
            averagePace: parseFloat(averagePace.toFixed(2)),
            averageSpeed: parseFloat(averageSpeed.toFixed(2)),
            longestRun: parseFloat(longestRun.toFixed(2)),
            fastestPace: parseFloat(fastestPace.toFixed(2)),
          });
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Prepare data for distance over time chart (last 30 days)
  const prepareDistanceOverTimeData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
    const labels = last30Days.map(date => format(date, 'MMM dd'));
    
    const data = last30Days.map(date => {
      const activitiesOnDate = activities.filter(activity => 
        isSameDay(parseISO(activity.date), date)
      );
      
      return activitiesOnDate.reduce((sum, activity) => sum + activity.distance, 0);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Distance (km)',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };

  // Prepare data for monthly distance chart
  const prepareMonthlyDistanceData = () => {
    const currentDate = new Date();
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
    const labels = daysInMonth.map(date => format(date, 'd'));
    
    const data = daysInMonth.map(date => {
      const activitiesOnDate = activities.filter(activity => 
        isSameDay(parseISO(activity.date), date)
      );
      
      return activitiesOnDate.reduce((sum, activity) => sum + activity.distance, 0);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Distance (km)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  // Prepare data for pace distribution chart
  const preparePaceDistributionData = () => {
    // Group activities by pace ranges
    const paceRanges = [
      { min: 0, max: 4, label: '<4 min/km' },
      { min: 4, max: 5, label: '4-5 min/km' },
      { min: 5, max: 6, label: '5-6 min/km' },
      { min: 6, max: 7, label: '6-7 min/km' },
      { min: 7, max: 8, label: '7-8 min/km' },
      { min: 8, max: 100, label: '>8 min/km' },
    ];
    
    const paceDistribution = paceRanges.map(range => {
      return activities.filter(activity => 
        activity.pace && activity.pace >= range.min && activity.pace < range.max
      ).length;
    });
    
    return {
      labels: paceRanges.map(range => range.label),
      datasets: [
        {
          data: paceDistribution,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Format duration from seconds to HH:MM:SS
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Recent activities table
  const recentActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Container>
      <h1 className="my-4">Running Dashboard</h1>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="h-100 total-activities-card">
                <Card.Body>
                  <Card.Title>Total Activities</Card.Title>
                  <h2>{stats.totalActivities}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100 total-distance-card">
                <Card.Body>
                  <Card.Title>Total Distance</Card.Title>
                  <h2>{stats.totalDistance} km</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100 total-duration-card">
                <Card.Body>
                  <Card.Title>Total Duration</Card.Title>
                  <h2>{formatDuration(stats.totalDuration)}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="h-100 average-pace-card">
                <Card.Body>
                  <Card.Title>Average Pace</Card.Title>
                  <h2>{stats.averagePace} min/km</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 average-speed-card">
                <Card.Body>
                  <Card.Title>Average Speed</Card.Title>
                  <h2>{stats.averageSpeed} km/h</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 longest-run-card">
                <Card.Body>
                  <Card.Title>Longest Run</Card.Title>
                  <h2>{stats.longestRun} km</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="h-100 fastest-pace-card">
                <Card.Body>
                  <Card.Title>Fastest Pace</Card.Title>
                  <h2>{stats.fastestPace} min/km</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row className="mb-4">
            <Col lg={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Distance Over Time (Last 30 Days)</Card.Title>
                  <div style={{ height: '300px' }}>
                    <Line 
                      data={prepareDistanceOverTimeData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Distance (km)'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Date'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Monthly Distance</Card.Title>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={prepareMonthlyDistanceData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Distance (km)'
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Day of Month'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Pace Distribution</Card.Title>
                  <div style={{ height: '300px' }}>
                    <Pie 
                      data={preparePaceDistributionData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Recent Activities</Card.Title>
                  {recentActivities.length === 0 ? (
                    <p>No recent activities found.</p>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Distance</th>
                          <th>Duration</th>
                          <th>Pace</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.map(activity => (
                          <tr key={activity.id}>
                            <td>{format(parseISO(activity.date), 'MMM dd, yyyy')}</td>
                            <td>{activity.distance} km</td>
                            <td>{Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}</td>
                            <td>{activity.pace ? `${activity.pace.toFixed(2)} min/km` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard; 