import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Checkbox, Button, FormControlLabel } from '@mui/material';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const WorkoutPlan = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
        limit(1)  // Only get the most recent plan
      );
      const querySnapshot = await getDocs(q);
      const plans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkoutPlans(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightUpdate = async (planId, dayIndex, exerciseIndex, weight) => {
    try {
      const planDoc = doc(db, 'workout-plans', planId);
      const updatedPlan = {...workoutPlans.find(p => p.id === planId)};
      updatedPlan.days[dayIndex].exercises[exerciseIndex].weight = weight;
      await updateDoc(planDoc, updatedPlan);
    } catch (error) {
      console.error("Error updating weight:", error);
    }
  };

  const handleWorkoutComplete = async (planId, dayIndex) => {
    try {
      const planDoc = doc(db, 'workout-plans', planId);
      const updatedPlan = {...workoutPlans.find(p => p.id === planId)};
      updatedPlan.days[dayIndex].completed = true;
      updatedPlan.days[dayIndex].completedDate = new Date();
      await updateDoc(planDoc, updatedPlan);
    } catch (error) {
      console.error("Error marking workout complete:", error);
    }
  };

  const handleWarmupComplete = async (dayNumber, completed) => {
    // Implementation needed
  };

  const handleExerciseComplete = async (dayNumber, exerciseIndex, completed) => {
    // Implementation needed
  };

  const handleCooldownComplete = async (dayNumber, completed) => {
    // Implementation needed
  };

  const handleDayUpdate = async (planId, dayNumber, updatedDay) => {
    try {
      const planDoc = doc(db, 'workout-plans', planId);
      const updatedPlan = {...workoutPlans.find(p => p.id === planId)};
      updatedPlan.days[dayNumber - 1] = updatedDay;
      await updateDoc(planDoc, updatedPlan);
      
      // Update local state
      setWorkoutPlans(plans => 
        plans.map(plan => 
          plan.id === planId ? updatedPlan : plan
        )
      );
    } catch (error) {
      console.error("Error updating day:", error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // If no workout plans exist
  if (workoutPlans.length === 0) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography variant="h5">No workout plan found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Generate a new workout plan to get started!
        </Typography>
      </Box>
    );
  }

  // Get the most recent plan
  const latestPlan = workoutPlans[0];

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Current Workout Plan</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Generated on {new Date(latestPlan.createdAt).toLocaleDateString()}
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        {latestPlan.days.map((day) => (
          <DayCard 
            key={day.dayNumber} 
            day={day}
            onUpdate={(dayNumber, updatedDay) => handleDayUpdate(latestPlan.id, dayNumber, updatedDay)}
          />
        ))}
      </Box>
    </Box>
  );
};

const DayCard = ({ day, onUpdate }) => {
  // Ensure arrays exist with default empty arrays
  const warmupExercises = Array.isArray(day.warmup) ? day.warmup : [];
  const workoutExercises = Array.isArray(day.workout) ? day.workout : [];
  const cooldownExercises = Array.isArray(day.cooldown) ? day.cooldown : [];

  const handleWarmupComplete = async (dayNumber, completed) => {
    try {
      const updatedDay = {
        ...day,
        warmup: warmupExercises.map(w => ({
          ...w,
          completed: completed
        }))
      };
      onUpdate(dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating warmup completion:", error);
    }
  };

  const handleExerciseComplete = async (dayNumber, exerciseIndex, completed) => {
    try {
      const updatedDay = {
        ...day,
        workout: workoutExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, completed }
            : exercise
        )
      };
      onUpdate(dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating exercise completion:", error);
    }
  };

  const handleCooldownComplete = async (dayNumber, completed) => {
    try {
      const updatedDay = {
        ...day,
        cooldown: cooldownExercises.map(c => ({
          ...c,
          completed: completed
        }))
      };
      onUpdate(dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating cooldown completion:", error);
    }
  };

  const handleWeightUpdate = async (dayNumber, exerciseIndex, weight) => {
    try {
      const updatedDay = {
        ...day,
        workout: workoutExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, weight }
            : exercise
        )
      };
      onUpdate(dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating weight:", error);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Day {day.dayNumber}: {day.focus}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Estimated Time: {day.estimatedTime}
      </Typography>

      {/* Warmup Section */}
      {warmupExercises.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Warm-up</Typography>
          {warmupExercises.map((warmup, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={warmup.completed || false}
                  onChange={(e) => handleWarmupComplete(day.dayNumber, e.target.checked)}
                />
              }
              label={
                <Typography>
                  {warmup.name} - {warmup.sets} x {warmup.reps}
                  <br />
                  <small>{warmup.notes}</small>
                </Typography>
              }
            />
          ))}
        </Box>
      )}

      {/* Main Workout Table */}
      {workoutExercises.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exercise</TableCell>
                <TableCell>Sets & Reps</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>Completed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workoutExercises.map((exercise, index) => (
                <TableRow key={index}>
                  <TableCell>{exercise.name}</TableCell>
                  <TableCell>{exercise.sets} x {exercise.reps}</TableCell>
                  <TableCell>{exercise.notes}</TableCell>
                  <TableCell>
                    {exercise.weightTracking && (
                      <TextField
                        size="small"
                        value={exercise.weight || ''}
                        onChange={(e) => handleWeightUpdate(day.dayNumber, index, e.target.value)}
                        placeholder="lbs"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={exercise.completed || false}
                      onChange={(e) => handleExerciseComplete(day.dayNumber, index, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cooldown Section */}
      {cooldownExercises.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Cool-down</Typography>
          {cooldownExercises.map((cooldown, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={cooldown.completed || false}
                  onChange={(e) => handleCooldownComplete(day.dayNumber, e.target.checked)}
                />
              }
              label={
                <Typography>
                  {cooldown.name} - {cooldown.duration}
                  <br />
                  <small>{cooldown.notes}</small>
                </Typography>
              }
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WorkoutPlan;