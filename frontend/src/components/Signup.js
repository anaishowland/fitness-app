import React, { useState } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Logo from './Logo';


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize navigate


  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User signed up successfully!");
      navigate("/"); // Redirect to questionnaire
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already in use. Please use another email or reset your password.");
      } else {
        console.error("Error signing up:", error);
        alert(error.message);
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Please enter your email to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/questionnaire");
    } catch (error) {
      console.error("Error signing up with Google:", error);
      alert(error.message);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      navigate("/questionnaire");
    } catch (error) {
      console.error("Error signing up with Facebook:", error);
      alert(error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <Box sx={{ mb: 4 }}>
        <Logo size="medium" />
      </Box>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignup}
        sx={{ mb: 2 }}
      >
        Sign up with Google
      </Button>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<FacebookIcon />}
        onClick={handleFacebookSignup}
        sx={{ mb: 2, backgroundColor: '#1877F2', color: 'white', '&:hover': { backgroundColor: '#0d6efd' } }}
      >
        Sign up with Facebook
      </Button>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <form onSubmit={handleSignup}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ padding: "10px", mb: 2 }}
        >
          Sign Up
        </Button>
      </form>

      <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
        Already have an account?{" "}
        <Link href="/login" underline="hover">
          Log in
        </Link>
      </Typography>

      <Typography variant="body2" sx={{ textAlign: "center", mt: 1 }}>
        Forgot your password?{" "}
        <Link href="#" underline="hover" onClick={handlePasswordReset}>
          Reset Password
        </Link>
      </Typography>
    </Box>
  );
};

export default Signup;
