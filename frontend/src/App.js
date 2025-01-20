import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

// Import components
import WorkoutGenerator from './components/WorkoutGenerator';
import Questionnaire from './components/Questionnaire';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import { darkTheme } from './components/theme';
import WorkoutPlan from './components/WorkoutPlan';

function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user has completed questionnaire
        try {
          const q = query(
            collection(db, 'questionnaire-responses'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          setHasProfile(!querySnapshot.empty);
        } catch (error) {
          console.error("Error checking profile:", error);
          setHasProfile(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar user={user} />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={!user ? <Login /> : <Navigate to={hasProfile ? "/profile" : "/questionnaire"} />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/questionnaire" />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                user 
                  ? hasProfile 
                    ? <Navigate to="/profile" />
                    : <Navigate to="/questionnaire" />
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/questionnaire" 
              element={user ? <Questionnaire /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={
                user 
                  ? hasProfile 
                    ? <Profile />
                    : <Navigate to="/questionnaire" />
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/edit-profile" 
              element={user ? <EditProfile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/generate-workout" 
              element={
                user 
                  ? hasProfile 
                    ? <WorkoutGenerator />
                    : <Navigate to="/questionnaire" />
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/workout-plan" 
              element={
                user 
                  ? hasProfile 
                    ? <WorkoutPlan />
                    : <Navigate to="/questionnaire" />
                  : <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
