import React, { useState } from 'react';
import axios from 'axios';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const GenerateWorkout = () => {
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/generate-workout', formData);
      
      // Add scheduled dates to the workout plan
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const workoutPlan = {
        ...response.data.workoutPlan,
        days: response.data.workoutPlan.days.map((day, index) => {
          const scheduledDate = new Date(startDate);
          scheduledDate.setDate(startDate.getDate() + index);
          return {
            ...day,
            scheduledDate: scheduledDate.toISOString(),
            completed: false
          };
        }),
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'workout-plans'), workoutPlan);
      console.log("Workout plan saved with ID:", docRef.id);
      
      navigate('/workout-plan');
    } catch (error) {
      console.error("Error generating workout plan:", error);
      setError("Failed to generate workout plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default GenerateWorkout; 