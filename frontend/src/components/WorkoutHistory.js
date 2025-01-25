import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const WorkoutHistory = () => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const q = query(
        collection(db, 'workout-plans'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setWorkoutHistory(history);
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletedWorkouts = (plan) => {
    return plan.days.filter(day => day.completed);
  };

  if (loading) {
    return <Typography>Loading workout history...</Typography>;
  }

  if (workoutHistory.length === 0) {
    return (
      <Box sx={{ padding: 3, textAlign: 'center' }}>
        <Typography variant="h5">No workout history found</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Complete some workouts to see your history!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Workout History
      </Typography>

      {workoutHistory.map((plan) => (
        <Accordion key={plan.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography variant="h6">
                Plan from {dayjs(plan.createdAt).format('MMMM D, YYYY')}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                {getCompletedWorkouts(plan).length} completed workouts
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Focus</TableCell>
                    <TableCell>Date Completed</TableCell>
                    <TableCell>Exercises Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.days
                    .filter(day => day.completed)
                    .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
                    .map((day) => {
                      const totalExercises = [
                        ...(day.warmup || []),
                        ...(day.workout || []),
                        ...(day.cooldown || [])
                      ];
                      const completedExercises = totalExercises.filter(ex => ex.completed);

                      return (
                        <TableRow key={day.dayNumber}>
                          <TableCell>Day {day.dayNumber}</TableCell>
                          <TableCell>{day.focus}</TableCell>
                          <TableCell>
                            {dayjs(day.completedDate).format('MMM D, YYYY')}
                          </TableCell>
                          <TableCell>
                            {completedExercises.length} / {totalExercises.length}
                          </TableCell>
                        </TableRow>
                      );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default WorkoutHistory; 