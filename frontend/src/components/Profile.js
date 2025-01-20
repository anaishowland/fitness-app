import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { COLORS } from './Navbar'; // Import the color constants

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, 'questionnaire-responses'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setProfileData(querySnapshot.docs[0].data());
        } else {
          // No profile data found, redirect to questionnaire
          navigate('/questionnaire');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate('/edit-profile', { state: { profileData } });
  };

  if (loading) {
    return <CircularProgress />;
  }

  // Only show profile content if we have data
  if (!profileData) {
    return null; // Return nothing while redirecting
  }

  return (
    <Box sx={{ 
      padding: 3, 
      maxWidth: 800, 
      margin: '0 auto',
      backgroundColor: COLORS.background,
      color: COLORS.roseGold
    }}>
      <Typography variant="h4" gutterBottom sx={{ color: COLORS.roseGold }}>
        Your Profile
      </Typography>
      
      {profileData && (
        <>
          <Typography variant="h6" sx={{ color: COLORS.roseGold }}>
            Personal Information
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ color: COLORS.roseGold }}>
              Name: {profileData.preferredName}
            </Typography>
            <Typography sx={{ color: COLORS.roseGold }}>
              Age: {profileData.age}
            </Typography>
            <Typography sx={{ color: COLORS.roseGold }}>
              Fitness Level: {profileData.fitnessLevel}/5
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            onClick={handleEditProfile}
            sx={{ 
              mr: 2,
              backgroundColor: COLORS.roseGold,
              color: COLORS.background,
              '&:hover': {
                backgroundColor: '#B3937A'
              }
            }}
          >
            Edit Profile
          </Button>
          
          <Button 
            variant="contained"
            onClick={() => navigate('/generate-workout')}
            sx={{ 
              mr: 2,
              backgroundColor: COLORS.roseGold,
              color: COLORS.background,
              '&:hover': {
                backgroundColor: '#B3937A'
              }
            }}
          >
            Generate Workout
          </Button>

          <Button 
            variant="contained"
            onClick={() => navigate('/workout-plan')}
            sx={{ 
              backgroundColor: COLORS.roseGold,
              color: COLORS.background,
              '&:hover': {
                backgroundColor: '#B3937A'
              }
            }}
          >
            View Workout Plan
          </Button>
        </>
      )}
    </Box>
  );
};

export default Profile; 