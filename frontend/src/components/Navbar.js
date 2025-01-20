import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';

// Define color constants to use throughout the app
export const COLORS = {
  background: '#1A1A1A',
  roseGold: '#C4A484',
  buttonHover: 'rgba(196, 164, 132, 0.1)',
  logoutRed: '#FF6347'
};

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert("You have been logged out.");
        navigate('/login');
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: COLORS.background,
        boxShadow: 'none',
        borderBottom: `1px solid ${COLORS.buttonHover}`,
        padding: '8px 0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box 
          onClick={() => navigate('/')} 
          sx={{ 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: COLORS.background
          }}
        >
          <img 
            src="/logo.png" 
            alt="ActiveYou" 
            style={{ 
              height: '60px',
              objectFit: 'contain',
              marginLeft: '20px'
            }} 
          />
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          marginRight: '20px',
          alignItems: 'center'
        }}>
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={() => navigate('/profile')}
                sx={{ 
                  color: COLORS.roseGold,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: COLORS.buttonHover
                  },
                  borderBottom: location.pathname === '/profile' ? `2px solid ${COLORS.roseGold}` : 'none'
                }}
              >
                Profile
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/generate-workout')}
                sx={{ 
                  color: COLORS.roseGold,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: COLORS.buttonHover
                  },
                  borderBottom: location.pathname === '/generate-workout' ? `2px solid ${COLORS.roseGold}` : 'none'
                }}
              >
                Generate Workout
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/workout-plan')}
                sx={{ 
                  color: COLORS.roseGold,
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: COLORS.buttonHover
                  },
                  borderBottom: location.pathname === '/workout-plan' ? `2px solid ${COLORS.roseGold}` : 'none'
                }}
              >
                My Workout Plan
              </Button>
              <Button 
                color="inherit" 
                onClick={() => auth.signOut()}
                sx={{ 
                  backgroundColor: COLORS.logoutRed,
                  color: 'white',
                  fontSize: '1.1rem',
                  '&:hover': {
                    backgroundColor: '#FF4433'
                  }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
