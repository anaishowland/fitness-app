import React, { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Box, TextField, Button, Typography, Divider } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Logo from './Logo';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("User logged in successfully!");
      navigate("/"); // Redirect to questionnaire
    } catch (error) {
      console.error("Error logging in:", error);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/questionnaire");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      alert(error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      navigate("/questionnaire");
    } catch (error) {
      console.error("Error logging in with Facebook:", error);
      alert(error.message);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: "450px",
      margin: "20px auto",
      padding: "40px",
      backgroundColor: 'rgba(25, 25, 25, 0.9)',
      borderRadius: '15px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    }}>
      <Box sx={{ 
        mb: 5,
        textAlign: 'center',
        padding: '20px'
      }}>
        <Logo size="medium" />
      </Box>

      <Button
        variant="contained"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogleLogin}
        sx={{ 
          mb: 2,
          backgroundColor: '#ffffff',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        Sign in with Google
      </Button>

      <Button
        variant="contained"
        fullWidth
        startIcon={<FacebookIcon />}
        onClick={handleFacebookLogin}
        sx={{ 
          mb: 2,
          backgroundColor: '#1877F2',
          color: 'white',
          '&:hover': {
            backgroundColor: '#0d6efd'
          }
        }}
      >
        Sign in with Facebook
      </Button>

      <Divider sx={{ my: 3, color: '#DEB887', '&::before, &::after': { borderColor: '#DEB887' } }}>
        OR
      </Divider>

      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#DEB887',
              },
              '&:hover fieldset': {
                borderColor: '#DEB887',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#DEB887',
            },
            input: {
              color: '#DEB887'
            }
          }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#DEB887',
              },
              '&:hover fieldset': {
                borderColor: '#DEB887',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#DEB887',
            },
            input: {
              color: '#DEB887'
            }
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            padding: "10px",
            backgroundColor: '#DEB887',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#C4A484'
            }
          }}
        >
          Log In
        </Button>
      </form>
    </Box>
  );
};

export default Login;
