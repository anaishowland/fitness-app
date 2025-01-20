import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db, auth } from '../firebase';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, CircularProgress, Typography } from '@mui/material';

function WorkoutGenerator({ userData }) {
  const [loading, setLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Fetch questionnaire data when component mounts
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!auth.currentUser) return;
      
      try {
        const q = query(
          collection(db, 'questionnaire-responses'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setQuestionnaire(data);
        }
      } catch (error) {
        console.error("Error fetching questionnaire:", error);
      }
    };

    fetchQuestionnaire();
  }, []);

  const handleGenerateWorkout = async () => {
    if (!questionnaire) {
      alert("No questionnaire data available. Please complete the questionnaire first.");
      navigate('/questionnaire');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Sending questionnaire data:", questionnaire);
      
      const response = await axios.post('http://localhost:5001/api/generate-workout', questionnaire);
      
      // Log the complete axios response
      console.log("Complete axios response:", response);
      console.log("Response headers:", response.headers);
      console.log("Response status:", response.status);
      console.log("Complete response data:", JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Log each part of the response separately
      if (response.data.apiRequest) {
        console.log("OpenAI API Request:", typeof response.data.apiRequest, response.data.apiRequest);
      } else {
        console.warn("API request not found in response");
      }
      
      if (response.data.rawResponse) {
        console.log("Raw OpenAI Response:", typeof response.data.rawResponse, response.data.rawResponse);
      } else {
        console.warn("Raw response not found in response");
      }
      
      if (!response.data.workoutPlan) {
        throw new Error("No workout plan in response");
      }

      // Create the workout plan document
      const workoutPlan = {
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        days: response.data.workoutPlan.days || []
      };

      console.log("Final workout plan structure:", workoutPlan);

      const docRef = await addDoc(collection(db, 'workout-plans'), workoutPlan);
      console.log("Workout plan saved with ID:", docRef.id);
      navigate('/workout-plan');

    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error response:", error.response);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fallback function to parse Markdown and transform it
   * into the data structure: { days: Day[] }
   */
  // function parseMarkdownPlan(markdownText) {
  //   console.log("Parsing markdown text:", markdownText);
    
  //   const days = [];
  //   const dayRegex = /\*\*Day (\d+):\s*([^*]+)\*\*\n([\s\S]*?)(?=\*\*Day|\*\*Progression|$)/g;
    
  //   let dayMatch;
  //   while ((dayMatch = dayRegex.exec(markdownText)) !== null) {
  //     const dayNumber = parseInt(dayMatch[1]);
  //     const focus = dayMatch[2].trim();
  //     const content = dayMatch[3].trim();
      
  //     const lines = content.split('\n');
  //     const exercises = [];
  //     let warmupDescription = '';
  //     let cooldownDescription = '';
      
  //     lines.forEach(line => {
  //       line = line.trim();
  //       if (!line) return;

  //       if (line.toLowerCase().includes('warm-up:')) {
  //         warmupDescription = line.split(':')[1]?.trim() || '';
  //         return;
  //       }

  //       if (line.toLowerCase().includes('cool down:')) {
  //         cooldownDescription = line.split(':')[1]?.trim() || '';
  //         return;
  //       }

  //       const exerciseRegex = /^\d+\.\s*(.*?)\n\s*-\s*Sets:\s*(\d+)\n\s*-\s*Reps:\s*(.*?)\n\s*-\s*Rest:\s*(.*?)(?=\n|$)/;
  //       const exerciseMatch = line.match(exerciseRegex);

  //       if (exerciseMatch) {
  //         const [_, name, sets, reps] = exerciseMatch;
  //         exercises.push({
  //           name: name.trim(),
  //           setsReps: `${sets} sets x ${reps} reps`,
  //           equipment: '-', // Add logic if equipment is specified
  //           weight: '',
  //           completed: false
  //         });
  //       } else if (line.match(/[A-Za-z]/) && !line.toLowerCase().includes('warm') && !line.toLowerCase().includes('cool')) {
  //         exercises.push({
  //           name: line.trim(),
  //           setsReps: 'As prescribed',
  //           equipment: '-',
  //           weight: '',
  //           completed: false
  //         });
  //       }
  //     });

  //     days.push({
  //       dayNumber,
  //       focus,
  //       warmup: {
  //         description: warmupDescription || 'Dynamic warm-up',
  //         completed: false
  //       },
  //       workout: exercises,
  //       cooldown: {
  //         description: cooldownDescription || 'Static stretching and mobility work',
  //         completed: false
  //       }
  //     });
  //   }

  //   console.log("Parsed workout plan:", JSON.stringify({ days }, null, 2));
  //   return { days };
  // }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Workout Plan Generator
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Click below to generate a personalized workout plan based on your questionnaire responses.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleGenerateWorkout}
          disabled={loading || !questionnaire}
          sx={{
            minWidth: '200px',
            py: 2,
            px: 4,
            fontSize: '1.1rem'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} color="inherit" />
              <span>Generating...</span>
            </Box>
          ) : (
            'Generate Workout Plan'
          )}
        </Button>

        {!questionnaire && (
          <Typography variant="body2" color="error">
            Please complete the questionnaire first to generate a workout plan.
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
}

export default WorkoutGenerator;
