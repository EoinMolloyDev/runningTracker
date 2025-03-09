import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, ProgressBar, Modal, Form } from 'react-bootstrap';
import { Goal, GoalType, GoalTimeframe, goalsApi, RunningActivity, activitiesApi, CreateGoalDTO } from '../services/api';
import { formatPace } from '../utils/formatters';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import '../styles/Goals.css';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<RunningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // New goal form state
  const [formData, setFormData] = useState<Partial<Goal>>({
    name: '',
    description: '',
    targetValue: 0,
    currentValue: 0,
    goalType: GoalType.TotalDistance,
    timeframe: GoalTimeframe.Weekly,
    startDate: new Date().toISOString().split('T')[0],
    endDate: addWeeks(new Date(), 1).toISOString().split('T')[0],
    isCompleted: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Update goal progress first
        await goalsApi.updateAllProgress();
        
        // Then fetch the updated goals
        const goalsResponse = await goalsApi.getAll();
        setGoals(goalsResponse.data);
        
        // Fetch activities for reference (might be needed for UI purposes)
        await activitiesApi.getAll();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
    resetForm();
  };

  const handleShowModal = (goal: Goal | null = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description,
        targetValue: goal.targetValue,
        goalType: goal.goalType,
        timeframe: goal.timeframe,
        startDate: goal.startDate,
        endDate: goal.endDate
      });
    } else {
      setEditingGoal(null);
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetValue: 0,
      currentValue: 0,
      goalType: GoalType.TotalDistance,
      timeframe: GoalTimeframe.Weekly,
      startDate: new Date().toISOString().split('T')[0],
      endDate: addWeeks(new Date(), 1).toISOString().split('T')[0],
      isCompleted: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const timeframe = e.target.value as GoalTimeframe;
    const startDate = new Date();
    let endDate = new Date();
    
    switch (timeframe) {
      case GoalTimeframe.Weekly:
        endDate = addWeeks(startDate, 1);
        break;
      case GoalTimeframe.Monthly:
        endDate = addMonths(startDate, 1);
        break;
      case GoalTimeframe.Yearly:
        endDate = addYears(startDate, 1);
        break;
      default:
        endDate = addDays(startDate, 30); // Default to 30 days for custom
    }
    
    setFormData(prev => ({
      ...prev,
      timeframe,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Default dates if not provided
      const defaultStartDate = new Date().toISOString().split('T')[0];
      const defaultEndDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];

      // Validate required fields
      if (!formData.name) {
        alert('Goal name is required');
        return;
      }

      if (!formData.targetValue || formData.targetValue <= 0) {
        alert('Target value must be greater than 0');
        return;
      }

      if (editingGoal) {
        // For updating an existing goal
        const updateData = {
          ...editingGoal,
          name: formData.name,
          description: formData.description || '',
          targetValue: Number(formData.targetValue),
          goalType: formData.goalType || GoalType.TotalDistance,
          timeframe: formData.timeframe || GoalTimeframe.Weekly,
          startDate: formData.startDate || defaultStartDate,
          endDate: formData.endDate || defaultEndDate
        };
        
        console.log('Updating goal with data:', updateData);
        await goalsApi.update(editingGoal.id!, updateData);
      } else {
        // For creating a new goal
        const createData = {
          name: formData.name,
          description: formData.description || '',
          targetValue: Number(formData.targetValue),
          goalType: formData.goalType || GoalType.TotalDistance,
          timeframe: formData.timeframe || GoalTimeframe.Weekly,
          startDate: formData.startDate || defaultStartDate,
          endDate: formData.endDate || defaultEndDate
        };
        
        console.log('Creating goal with data:', createData);
        await goalsApi.create(createData);
      }
      
      // Refresh goals
      const goalsResponse = await goalsApi.getAll();
      setGoals(goalsResponse.data);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please check the console for details.');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsApi.delete(id);
        setGoals(goals.filter(goal => goal.id !== id));
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.currentValue === 0 || typeof goal.currentValue !== 'number' || typeof goal.targetValue !== 'number') return 0;
    
    // For pace goals, lower is better
    if (goal.goalType === GoalType.AveragePace || goal.goalType === GoalType.FastestPace) {
      // If current pace is better than target, cap at 100%
      return Math.min(100, (goal.targetValue / goal.currentValue) * 100);
    }
    
    // For other goals, higher is better
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getGoalTypeLabel = (type: GoalType) => {
    switch (type) {
      case GoalType.TotalDistance:
        return 'Total Distance (km)';
      case GoalType.TotalActivities:
        return 'Total Activities';
      case GoalType.AveragePace:
        return 'Average Pace (min/km)';
      case GoalType.LongestRun:
        return 'Longest Run (km)';
      case GoalType.FastestPace:
        return 'Fastest Pace (min/km)';
    }
  };

  const formatGoalValue = (goal: Goal, value: any) => {
    // Check if value is a valid number
    if (value === null || value === undefined || isNaN(Number(value)) || value === 0) {
      return '-';
    }
    
    // Ensure value is treated as a number
    const numValue = Number(value);
    
    switch (goal.goalType) {
      case GoalType.AveragePace:
      case GoalType.FastestPace:
        return formatPace(numValue);
      case GoalType.TotalDistance:
      case GoalType.LongestRun:
        return `${numValue.toFixed(2)} km`;
      default:
        return numValue.toString();
    }
  };

  const getGoalTypeClass = (type: GoalType) => {
    switch (type) {
      case GoalType.TotalDistance:
        return 'goal-total-distance';
      case GoalType.TotalActivities:
        return 'goal-total-activities';
      case GoalType.AveragePace:
        return 'goal-average-pace';
      case GoalType.LongestRun:
        return 'goal-longest-run';
      case GoalType.FastestPace:
        return 'goal-fastest-pace';
    }
  };

  // Add a function to refresh goal progress
  const refreshGoalProgress = async () => {
    try {
      setLoading(true);
      await goalsApi.updateAllProgress();
      
      // Refresh goals after updating progress
      const goalsResponse = await goalsApi.getAll();
      setGoals(goalsResponse.data);
      
      alert('Goal progress updated successfully!');
    } catch (error) {
      console.error('Error updating goal progress:', error);
      alert('Failed to update goal progress. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Running Goals</h1>
        <div>
          <Button variant="info" onClick={refreshGoalProgress} className="me-2">
            Refresh Progress
          </Button>
          <Button variant="success" onClick={() => handleShowModal()}>
            Add New Goal
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading goals...</p>
      ) : goals.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h4>No goals set yet</h4>
            <p>Set your first running goal to start tracking your progress!</p>
            <Button variant="primary" onClick={() => handleShowModal()}>
              Set a Goal
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {goals.map(goal => (
            <Col md={6} lg={4} key={goal.id} className="mb-4">
              <Card className={getGoalTypeClass(goal.goalType)}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{goal.name}</h5>
                    {goal.isCompleted && (
                      <Badge bg="success">Completed</Badge>
                    )}
                  </div>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleShowModal(goal)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {goal.description && (
                    <p className="text-muted">{goal.description}</p>
                  )}
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Goal Type</small>
                    <strong>{getGoalTypeLabel(goal.goalType)}</strong>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Target</small>
                    <strong>{formatGoalValue(goal, goal.targetValue)}</strong>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Current</small>
                    <strong>{formatGoalValue(goal, goal.currentValue)}</strong>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted d-block">Timeframe</small>
                    <strong>{goal.timeframe}</strong>
                    <div className="text-muted small">
                      {format(new Date(goal.startDate), 'MMM d, yyyy')} - {format(new Date(goal.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div>
                    <small className="text-muted d-block">Progress</small>
                    <ProgressBar 
                      now={getProgressPercentage(goal)} 
                      variant={getProgressVariant(getProgressPercentage(goal))}
                      label={`${Math.round(getProgressPercentage(goal))}%`}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Goal Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Goal Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Run 50km this month"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Add details about your goal"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Goal Type</Form.Label>
              <Form.Select
                name="goalType"
                value={formData.goalType}
                onChange={handleInputChange}
                required
              >
                <option value={GoalType.TotalDistance}>Total Distance (km)</option>
                <option value={GoalType.TotalActivities}>Total Activities</option>
                <option value={GoalType.AveragePace}>Average Pace (min/km)</option>
                <option value={GoalType.LongestRun}>Longest Run (km)</option>
                <option value={GoalType.FastestPace}>Fastest Pace (min/km)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Value</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="targetValue"
                value={formData.targetValue}
                onChange={handleInputChange}
                required
                placeholder="Enter your target value"
              />
              <Form.Text className="text-muted">
                {formData.goalType === GoalType.AveragePace || formData.goalType === GoalType.FastestPace
                  ? "For pace goals, enter the target pace in minutes per kilometer (e.g., 5.30 for 5:30 min/km)"
                  : formData.goalType === GoalType.TotalDistance || formData.goalType === GoalType.LongestRun
                    ? "Enter distance in kilometers"
                    : "Enter the number of activities"
                }
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Timeframe</Form.Label>
              <Form.Select
                name="timeframe"
                value={formData.timeframe}
                onChange={handleTimeframeChange}
                required
              >
                <option value={GoalTimeframe.Weekly}>Weekly</option>
                <option value={GoalTimeframe.Monthly}>Monthly</option>
                <option value={GoalTimeframe.Yearly}>Yearly</option>
                <option value={GoalTimeframe.Custom}>Custom</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Goals; 