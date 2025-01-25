import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Checkbox, Button, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { LocalizationProvider, DateCalendar, DatePicker, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkoutPlan = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, day: null });
  const navigate = useNavigate();

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

  const updateWorkoutPlanWithDates = async (planId, plan) => {
    try {
      const startDate = new Date(plan.createdAt || new Date());
      startDate.setHours(0, 0, 0, 0);

      const updatedDays = plan.days.map((day, index) => {
        if (!day.scheduledDate) {
          const scheduledDate = new Date(startDate);
          scheduledDate.setDate(startDate.getDate() + index);
          return {
            ...day,
            scheduledDate: scheduledDate.toISOString(),
            completed: false
          };
        }
        return day;
      });

      const planDoc = doc(db, 'workout-plans', planId);
      await updateDoc(planDoc, { days: updatedDays });
      return { ...plan, days: updatedDays };
    } catch (error) {
      console.error("Error updating workout plan with dates:", error);
      return plan;
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      const q = query(
        collection(db, 'workout-plans'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      const plans = await Promise.all(querySnapshot.docs.map(async doc => {
        const planData = doc.data();
        // Check if any day is missing a scheduled date
        const needsDateUpdate = planData.days.some(day => !day.scheduledDate);
        
        if (needsDateUpdate) {
          console.log('Updating plan with scheduled dates:', doc.id);
          const updatedPlan = await updateWorkoutPlanWithDates(doc.id, planData);
          return {
            id: doc.id,
            ...updatedPlan
          };
        }
        
        return {
          id: doc.id,
          ...planData
        };
      }));
      
      console.log("Fetched workout plans:", plans);
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

      // Mark the day as completed
      dayToUpdate.completed = true;
      dayToUpdate.completedDate = new Date().toISOString();

      // Update Firestore
      await updateDoc(planDoc, updatedPlan);

      // Update local state
      setWorkoutPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? updatedPlan : plan
        )
      );

      // Show success message
      alert('Workout completed! All exercises have been marked as finished.');
    } catch (error) {
      console.error("Error marking workout complete:", error);
      alert("Failed to mark workout as complete. Please try again.");
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

  const handleFeedbackSubmit = async (updateType) => {
    if (!feedback.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const latestPlan = workoutPlans[0];
      const selectedDay = selectedDayWorkout?.dayNumber;
      
      console.log('Sending update request:', {
        userId: auth.currentUser.uid,
        currentPlan: latestPlan,
        feedback,
        updateType,
        selectedDay
      });

      const response = await axios.post('http://localhost:5001/api/update-workout', {
        userId: auth.currentUser.uid,
        currentPlan: {
          days: latestPlan.days,
          id: latestPlan.id,
          userId: latestPlan.userId,
          createdAt: latestPlan.createdAt
        },
        feedback,
        updateType,
        selectedDay
      });

      console.log('Received response:', response.data);

      if (response.data.workoutPlan) {
        let updatedPlan;
        
        if (updateType === 'single' && selectedDay) {
          // Update only the selected day
          updatedPlan = {
            ...latestPlan,
            days: latestPlan.days.map(day => 
              day.dayNumber === selectedDay
                ? {
                    ...response.data.workoutPlan.days.find(d => d.dayNumber === selectedDay),
                    scheduledDate: day.scheduledDate,
                    completed: day.completed || false
                  }
                : day
            ),
            lastFeedback: feedback,
            lastFeedbackDate: new Date().toISOString()
          };
        } else {
          // Update entire week
          updatedPlan = {
            ...latestPlan,
            days: response.data.workoutPlan.days.map((day, index) => ({
              ...day,
              scheduledDate: latestPlan.days[index]?.scheduledDate || day.scheduledDate,
              completed: latestPlan.days[index]?.completed || false
            })),
            lastFeedback: feedback,
            lastFeedbackDate: new Date().toISOString()
          };
        }

        // Update Firestore
        const planDoc = doc(db, 'workout-plans', latestPlan.id);
        await updateDoc(planDoc, updatedPlan);

        // Update local state
        setWorkoutPlans(prevPlans => [updatedPlan, ...prevPlans.slice(1)]);
        setFeedbackOpen(false);
        setFeedback('');
      }
    } catch (error) {
      console.error("Error updating workout:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("Failed to update workout plan. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleReschedule = async (newDate) => {
    try {
      const latestPlan = workoutPlans[0];
      const dayToReschedule = rescheduleDialog.day;
      const daysDifference = dayjs(newDate).diff(dayjs(dayToReschedule.scheduledDate), 'days');
      
      // Update the scheduled dates for the selected day and all subsequent days
      const updatedDays = latestPlan.days.map(day => {
        if (day.dayNumber < dayToReschedule.dayNumber) {
          // Keep earlier days unchanged
          return day;
        } else {
          // Shift this day and all subsequent days by the same number of days
          const currentScheduledDate = dayjs(day.scheduledDate);
          const newScheduledDate = currentScheduledDate.add(daysDifference, 'day');
          
          return {
            ...day,
            scheduledDate: newScheduledDate.toISOString()
          };
        }
      });

      // Update the plan in Firestore
      const planDoc = doc(db, 'workout-plans', latestPlan.id);
      await updateDoc(planDoc, { days: updatedDays });

      // Update local state
      setWorkoutPlans(prevPlans => [{
        ...prevPlans[0],
        days: updatedDays
      }, ...prevPlans.slice(1)]);

      // Close the dialog and update selected date
      setRescheduleDialog({ open: false, day: null });
      setSelectedDate(newDate);

      // Show success message
      alert('Workout schedule updated successfully');
    } catch (error) {
      console.error("Error rescheduling workout:", error);
      alert("Failed to reschedule workout. Please try again.");
    }
  };

  const getWorkoutDays = () => {
    if (!workoutPlans || workoutPlans.length === 0) {
      console.log("No workout plans available");
      return [];
    }

    console.log("Current workout plan:", workoutPlans[0]); // Debug log

    const days = workoutPlans[0].days.map(day => {
      if (!day.scheduledDate) {
        console.log(`Day ${day.dayNumber} has no scheduled date`);
        return null;
      }
      
      try {
        const date = dayjs(day.scheduledDate);
        if (!date.isValid()) {
          console.log(`Invalid date for day ${day.dayNumber}:`, day.scheduledDate);
          return null;
        }
        console.log(`Day ${day.dayNumber} scheduled for:`, date.format('YYYY-MM-DD'));
        return date;
      } catch (error) {
        console.error(`Error parsing date for day ${day.dayNumber}:`, error);
        return null;
      }
    }).filter(Boolean);

    console.log("Total workout days with valid dates:", days.length);
    console.log("Workout days:", days.map(d => d.format('YYYY-MM-DD')));
    return days;
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
  const selectedDayWorkout = latestPlan.days.find(day => {
    if (!day.scheduledDate) return false;
    const scheduledDate = dayjs(day.scheduledDate);
    const selected = dayjs(selectedDate);
    const isSameDay = scheduledDate.format('YYYY-MM-DD') === selected.format('YYYY-MM-DD');
    console.log(`Comparing dates - Scheduled: ${scheduledDate.format('YYYY-MM-DD')}, Selected: ${selected.format('YYYY-MM-DD')}, Match: ${isSameDay}`); // Debug log
    return isSameDay;
  });

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom>Workout Calendar</Typography>
          <Typography variant="subtitle1" gutterBottom>
            Plan generated on {new Date(latestPlan.createdAt).toLocaleDateString()}
          </Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/workout-history')}
          >
            View History
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setFeedbackOpen(true)}
          >
            Update My Workout
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, mt: 4 }}>
        {/* Calendar Section */}
        <Box sx={{ flex: '0 0 auto' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              renderDay={(day, selectedDates, pickersDayProps) => {
                const workoutDays = getWorkoutDays();
                const currentDate = dayjs(day);
                
                const isWorkoutDay = workoutDays.some(date => 
                  date.format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
                );

                return (
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <PickersDay 
                      {...pickersDayProps} 
                      day={day}
                      sx={{
                        backgroundColor: isWorkoutDay ? 'primary.light' : 'inherit',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        },
                      }}
                    />
                    {isWorkoutDay && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '2px',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    )}
                  </Box>
                );
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Workout Details Section */}
        <Box sx={{ flex: '1 1 auto' }}>
          {selectedDayWorkout ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Day {selectedDayWorkout.dayNumber}: {selectedDayWorkout.focus}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setRescheduleDialog({ open: true, day: selectedDayWorkout })}
                    sx={{ mr: 1 }}
                  >
                    Reschedule
                  </Button>
                  {selectedDayWorkout.completed ? (
                    <Button
                      variant="contained"
                      color="success"
                      disabled
                    >
                      Completed
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleWorkoutComplete(latestPlan.id, selectedDayWorkout.dayNumber - 1)}
                    >
                      Mark Complete
                    </Button>
                  )}
                </Box>
              </Box>
              <DayCard 
                day={selectedDayWorkout}
                onUpdate={(dayNumber, updatedDay) => handleDayUpdate(latestPlan.id, dayNumber, updatedDay)}
              />
            </Box>
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
              No workout scheduled for {selectedDate.format('MMMM D, YYYY')}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Update Workout Dialog */}
      <Dialog 
        open={feedbackOpen} 
        onClose={() => setFeedbackOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Your Workout Plan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Let us know what adjustments you need:
          </Typography>
          <Box component="ul" sx={{ mb: 2, color: 'text.secondary' }}>
            <li>If certain exercises are too difficult or too easy</li>
            <li>If the workout duration doesn't match your available time</li>
            <li>If you need modifications due to equipment availability</li>
            <li>If you have any injuries or limitations we should consider</li>
          </Box>
          <TextField
            autoFocus
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please describe your needed adjustments here..."
            disabled={submittingFeedback}
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button 
              onClick={() => setFeedbackOpen(false)} 
              disabled={submittingFeedback}
              sx={{ flex: '0 0 auto' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleFeedbackSubmit('single')}
              variant="contained" 
              color="info"
              disabled={!feedback.trim() || submittingFeedback}
              fullWidth
              sx={{ flex: 1 }}
            >
              {submittingFeedback ? 'Updating...' : `Update ${selectedDayWorkout ? `Day ${selectedDayWorkout.dayNumber}` : 'Selected Day'}`}
            </Button>
            <Button 
              onClick={() => handleFeedbackSubmit('week')}
              variant="contained" 
              color="primary"
              disabled={!feedback.trim() || submittingFeedback}
              fullWidth
              sx={{ flex: 1 }}
            >
              {submittingFeedback ? 'Updating...' : 'Update Entire Week'}
            </Button>
          </Box>
          {submittingFeedback && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Generating your updated workout plan...
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog 
        open={rescheduleDialog.open} 
        onClose={() => setRescheduleDialog({ open: false, day: null })}
      >
        <DialogTitle>Reschedule Workout</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a new date for this workout:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={(newDate) => handleReschedule(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog({ open: false, day: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DayCard = ({ day, onUpdate }) => {
  // Ensure arrays exist with default empty arrays
  const warmupExercises = Array.isArray(day.warmup) ? day.warmup : [];
  const workoutExercises = Array.isArray(day.workout) ? day.workout : [];
  const cooldownExercises = Array.isArray(day.cooldown) ? day.cooldown : [];

  const handleWarmupExerciseComplete = async (exerciseIndex, completed) => {
    try {
      const updatedDay = {
        ...day,
        warmup: warmupExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, completed }
            : exercise
        )
      };
      onUpdate(day.dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating warmup exercise completion:", error);
    }
  };

  const handleCooldownExerciseComplete = async (exerciseIndex, completed) => {
    try {
      const updatedDay = {
        ...day,
        cooldown: cooldownExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, completed }
            : exercise
        )
      };
      onUpdate(day.dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating cooldown exercise completion:", error);
    }
  };

  const handleExerciseComplete = async (exerciseIndex, completed) => {
    try {
      const updatedDay = {
        ...day,
        workout: workoutExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, completed }
            : exercise
        )
      };
      onUpdate(day.dayNumber, updatedDay);
    } catch (error) {
      console.error("Error updating exercise completion:", error);
    }
  };

  const handleWeightUpdate = async (exerciseIndex, weight) => {
    try {
      const updatedDay = {
        ...day,
        workout: workoutExercises.map((exercise, index) => 
          index === exerciseIndex 
            ? { ...exercise, weight }
            : exercise
        )
      };
      onUpdate(day.dayNumber, updatedDay);
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Warm-up</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exercise</TableCell>
                  <TableCell>Sets & Reps</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warmupExercises.map((exercise, index) => (
                  <TableRow key={index}>
                    <TableCell>{exercise.name}</TableCell>
                    <TableCell>{exercise.sets} x {exercise.reps}</TableCell>
                    <TableCell>{exercise.notes}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={exercise.completed || false}
                        onChange={(e) => handleWarmupExerciseComplete(index, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Main Workout Table */}
      {workoutExercises.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Main Workout</Typography>
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
                          onChange={(e) => handleWeightUpdate(index, e.target.value)}
                          placeholder="lbs"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={exercise.completed || false}
                        onChange={(e) => handleExerciseComplete(index, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Cooldown Section */}
      {cooldownExercises.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Cool-down</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exercise</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cooldownExercises.map((exercise, index) => (
                  <TableRow key={index}>
                    <TableCell>{exercise.name}</TableCell>
                    <TableCell>{exercise.duration}</TableCell>
                    <TableCell>{exercise.notes}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={exercise.completed || false}
                        onChange={(e) => handleCooldownExerciseComplete(index, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default WorkoutPlan;