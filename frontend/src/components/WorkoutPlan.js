import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ExerciseDetails from './ExerciseDetails';

const WorkoutPlan = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchWorkoutPlans();
      } else {
        setWorkoutPlans([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      const q = query(
        collection(db, 'workout-plans'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      const plans = await Promise.all(querySnapshot.docs.map(async doc => ({
        id: doc.id,
        ...doc.data()
      })));
      
      setWorkoutPlans(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutComplete = async (planId, dayIndex) => {
    try {
      const planDoc = doc(db, 'workout-plans', planId);
      const updatedPlan = {...workoutPlans.find(p => p.id === planId)};
      const dayToUpdate = updatedPlan.days[dayIndex];

      // Mark all exercises as completed
      if (dayToUpdate.warmup) {
        dayToUpdate.warmup = dayToUpdate.warmup.map(exercise => ({
          ...exercise,
          completed: true
        }));
      }

      if (dayToUpdate.workout) {
        dayToUpdate.workout = dayToUpdate.workout.map(exercise => ({
          ...exercise,
          completed: true
        }));
      }

      if (dayToUpdate.cooldown) {
        dayToUpdate.cooldown = dayToUpdate.cooldown.map(exercise => ({
          ...exercise,
          completed: true
        }));
      }

      dayToUpdate.completed = true;
      dayToUpdate.completedDate = new Date().toISOString();

      await updateDoc(planDoc, updatedPlan);
      setWorkoutPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? updatedPlan : plan
        )
      );
    } catch (error) {
      console.error("Error marking workout complete:", error);
    }
  };

  const handleWeightUpdate = async (planId, dayIndex, exerciseName, weight) => {
    try {
      const planDoc = doc(db, 'workout-plans', planId);
      const updatedPlan = {...workoutPlans.find(p => p.id === planId)};
      const dayToUpdate = updatedPlan.days[dayIndex];

      // Update the weight for the specific exercise
      if (dayToUpdate.workout) {
        dayToUpdate.workout = dayToUpdate.workout.map(exercise => 
          exercise.name === exerciseName 
            ? { ...exercise, weight } 
            : exercise
        );
      }

      await updateDoc(planDoc, updatedPlan);
      setWorkoutPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? updatedPlan : plan
        )
      );
    } catch (error) {
      console.error("Error updating exercise weight:", error);
    }
  };

  const handleFeedbackSubmit = async (updateType) => {
    if (!feedback.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const latestPlan = workoutPlans[0];
      const selectedDay = latestPlan.days.find(day => 
        dayjs(day.scheduledDate).isSame(selectedDate, 'day')
      );
      
      const response = await axios.post('http://localhost:5001/api/update-workout', {
        userId: auth.currentUser.uid,
        currentPlan: latestPlan,
        feedback,
        updateType,
        selectedDay: selectedDay?.dayNumber
      });

      if (response.data.workoutPlan) {
        const planDoc = doc(db, 'workout-plans', latestPlan.id);
        await updateDoc(planDoc, {
          days: response.data.workoutPlan.days
        });
        
        await fetchWorkoutPlans();
      }
    } catch (error) {
      console.error("Error updating workout plan:", error);
    } finally {
      setSubmittingFeedback(false);
      setFeedbackOpen(false);
    }
  };

  const renderWorkoutSection = (title, exercises, type, planId, dayIndex) => {
    if (!exercises || exercises.length === 0) return null;

    return (
      <Box mb={3}>
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
        
        {/* Table Headers */}
        <Grid container spacing={2} sx={{ mb: 1, px: 2 }}>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              Exercise
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              Sets × Reps
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              Weight
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              Notes
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <Typography variant="caption" color="text.secondary" fontWeight="medium">
              Video
            </Typography>
          </Grid>
        </Grid>

        {/* Exercise Rows */}
        {exercises.map((exercise, index) => (
          <ExerciseDetails
            key={index}
            exercise={exercise}
            type={type}
            onWeightUpdate={type === 'workout' && exercise.weightTracking 
              ? (exerciseName, weight) => handleWeightUpdate(planId, dayIndex, exerciseName, weight)
              : undefined}
          />
        ))}
      </Box>
    );
  };

  const renderWorkoutDay = (day, index) => {
    const isScheduledForToday = dayjs(day.scheduledDate).isSame(selectedDate, 'day');
    
    return (
      <Paper 
        elevation={isScheduledForToday ? 3 : 1}
        sx={{ 
          p: 3, 
          mb: 3,
          border: isScheduledForToday ? '2px solid #1976d2' : 'none'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Day {day.dayNumber}: {day.focus}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Target: {day.targetedGoal}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Intensity: {day.intensityLevel} | Duration: {day.estimatedTime}
            </Typography>
          </Box>
          {!day.completed && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleWorkoutComplete(workoutPlans[0].id, index)}
            >
              Complete Workout
            </Button>
          )}
        </Box>

        {renderWorkoutSection('Warm-up', day.warmup, 'warmup', workoutPlans[0].id, index)}
        {renderWorkoutSection('Workout', day.workout, 'workout', workoutPlans[0].id, index)}
        {renderWorkoutSection('Cool-down', day.cooldown, 'cooldown', workoutPlans[0].id, index)}
      </Paper>
    );
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!workoutPlans.length) {
    return <Typography>No workout plan found.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Box display="flex" gap={3}>
        <Box flex={1}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Your Workout Calendar
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar 
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
              />
            </LocalizationProvider>
          </Paper>
          
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => setFeedbackOpen(true)}
            sx={{ mb: 2 }}
          >
            Update My Workout
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => navigate('/workout-history')}
          >
            View History
          </Button>
        </Box>

        <Box flex={3}>
          {workoutPlans[0].days
            .filter(day => dayjs(day.scheduledDate).isSame(selectedDate, 'day'))
            .map((day, index) => renderWorkoutDay(day, index))}
        </Box>
      </Box>

      <Dialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)}>
        <DialogTitle>Update Your Workout Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleFeedbackSubmit('single')}
            disabled={submittingFeedback}
          >
            Update This Day
          </Button>
          <Button 
            onClick={() => handleFeedbackSubmit('full')}
            disabled={submittingFeedback}
          >
            Update Full Week
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutPlan;