import React, { useState } from 'react';
import {
  Typography,
  TextField,
  IconButton,
  Link,
  Grid,
  Paper
} from '@mui/material';
import {
  VideoLibraryIcon
} from './icons';

const ExerciseDetails = ({ exercise, type, onWeightUpdate }) => {
  const [weight, setWeight] = useState(exercise.weight || '');

  const handleWeightChange = (event) => {
    const newWeight = event.target.value;
    setWeight(newWeight);
    if (onWeightUpdate) {
      onWeightUpdate(exercise.name, newWeight);
    }
  };

  return (
    <Paper sx={{ mb: 1, p: 1 }}>
      <Grid container alignItems="center" spacing={2}>
        {/* Exercise Name */}
        <Grid item xs={2}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {exercise.name}
          </Typography>
        </Grid>

        {/* Sets & Reps */}
        <Grid item xs={2}>
          <Typography variant="body2">
            {exercise.sets} × {exercise.reps}
          </Typography>
        </Grid>

        {/* Weight Input */}
        <Grid item xs={2}>
          {type === 'workout' && exercise.weightTracking && (
            <TextField
              size="small"
              type="number"
              value={weight}
              onChange={handleWeightChange}
              InputProps={{
                endAdornment: <Typography variant="caption">lbs</Typography>,
                sx: { height: '32px' }
              }}
              sx={{ width: '80px' }}
            />
          )}
        </Grid>

        {/* Notes */}
        <Grid item xs={5}>
          <Typography variant="body2" color="text.secondary">
            {exercise.notes}
          </Typography>
        </Grid>

        {/* Video Link */}
        <Grid item xs={1}>
          {exercise.videoUrl && (
            <IconButton
              component={Link}
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              color="primary"
            >
              <VideoLibraryIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExerciseDetails; 