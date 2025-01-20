import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Slider, Checkbox, FormGroup, FormControlLabel, MenuItem, Radio } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    preferredName: "",
    email: "",
    age: "",
    sex: "",
    fitnessGoalScale: 3,
    events: [],
    workoutDays: 3,
    workoutTime: 60,
    obstacles: [],
    preferredWorkouts: [],
    motivations: [],
    currentWorkoutDays: 0,
    currentWorkoutTime: 15,
    fitnessLevel: 3,
    pullUps: "None",
    pushUps: "None",
    cardioFrequency: "1x/week",
    cardioType: [],
    flexibility: 3,
    workoutLocations: [],
    equipmentStrength: [],
    equipmentCardio: [],
    equipmentMobility: [],
    fitnessTracker: [],
    injuries: "",
    injuryLocations: [],
    healthRisks: [],
  });

  const [user, setUser] = useState(null);
  const [localSection, setLocalSection] = useState(currentSection);

  useEffect(() => {
    const checkExistingQuestionnaire = async (userId) => {
      try {
        const q = query(
          collection(db, 'questionnaire-responses'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // User has already filled out questionnaire
          const data = querySnapshot.docs[0].data();
          setFormData(data);
          navigate('/profile'); // Redirect to a new profile page
        }
      } catch (error) {
        console.error("Error checking questionnaire:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkExistingQuestionnaire(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData((prevState) => {
      const updatedArray = checked
        ? [...prevState[name], value]
        : prevState[name].filter((item) => item !== value);
      return {
        ...prevState,
        [name]: updatedArray
      };
    });
  };

  const handleSubmitQuestionnaire = async (e) => {
    e.preventDefault();
    try {
      const cleanedFormData = {
        ...formData,
        userId: user.uid,
        timestamp: new Date()
      };

      console.log("Submitting form data:", cleanedFormData);

      const docRef = await addDoc(collection(db, "questionnaire-responses"), cleanedFormData);
      console.log("Document written with ID: ", docRef.id);
      
      alert("Questionnaire submitted successfully!");
      navigate('/generate-workout'); // Navigate to workout generator
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      alert(`Error submitting questionnaire: ${error.message}`);
    }
  };

  const commonBoxStyles = {
    padding: "20px",
    maxWidth: "600px",
    margin: "20px auto",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "background.paper",
  };

  const sections = [
    <Box key="section1" sx={commonBoxStyles}>
      {/* Section 1: Basic Info */}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Basic Info</h2>

      <div style={{ marginBottom: "20px" }}>
        {/* Question 1: Preferred Name */}
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Preferred First Name:
        </label>
        <TextField
          name="preferredName"
          value={formData.preferredName}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        {/* Question 2: Email */}
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Email Address:
        </label>
        <TextField
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        {/* Question 3: Age */}
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Age:
        </label>
        <TextField
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        {/* Question 4: Sex */}
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Sex:
        </label>
        <TextField
          name="sex"
          select
          value={formData.sex}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </TextField>
      </div>
    </Box>,

    <Box key="section2" sx={commonBoxStyles}>
      {/* Section 2: Fitness Goals */}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Fitness Goals</h2>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        {/* Question 1: Fitness Goal Scale */}
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          On a scale of 1 (Get Stronger) to 5 (Build Cardio), where do your goals lie?
        </label>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <Slider
            name="fitnessGoalScale"
            value={formData.fitnessGoalScale}
            onChange={(e, value) => handleChange({ target: { name: "fitnessGoalScale", value } })}
            step={1}
            marks={[
              { value: 1, label: <span>1<br /><small>Get Stronger</small></span> },
              { value: 2, label: "2" },
              { value: 3, label: <span>3<br /><small>Build Strength & Cardio</small></span> },
              { value: 4, label: "4" },
              { value: 5, label: <span>5<br /><small>Build Cardio</small></span> },
            ]}
            min={1}
            max={5}
            sx={{
              marginX: "auto",
              "& .MuiSlider-markLabel": {
                textAlign: "center",
                fontSize: "12px",
                color: "text.secondary",
              },
              "& .MuiSlider-root": {
                width: "100%",
              },
            }}
          />
        </div>
      </div>

      {/* Question 2: Events training for*/}
      <fieldset style={{ marginBottom: "20px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Are you training for a specific event? Check all that apply:</legend>
        <FormGroup>
          {["No","5k", "10k", "Half-Marathon", "Triathlon", "Spartan Race/Tough Mudder"].map((event) => (
            <FormControlLabel
              key={event}
              control={
                <Checkbox
                  name="events"
                  value={event}
                  onChange={handleCheckboxChange}
                  checked={formData.events.includes(event)}
                />
              }
              label={event}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="eventsOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    eventsOtherChecked: e.target.checked,
                    eventsOther: e.target.checked ? formData.eventsOther : "",
                  })
                }
                checked={!!formData.eventsOtherChecked}
              />
            }
            label={
              <TextField
                name="eventsOther"
                value={formData.eventsOther || ""}
                onChange={handleChange}
                placeholder="Other"
                disabled={!formData.eventsOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>

      {/* Question 3: Workout Days*/}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          How many days a week do you want to work out?
        </label>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <Slider
            value={formData.workoutDaysRange || [1, 7]}
            onChange={(e, value) => handleChange({ target: { name: "workoutDaysRange", value } })}
            step={1}
            marks={[
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
              { value: 6, label: "6" },
              { value: 7, label: "7" },
            ]}
            min={1}
            max={7}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-markLabel": {
                textAlign: "center",
                fontSize: "12px",
                color: "text.secondary",
              },
            }}
          />
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
            Selected Range: {formData.workoutDaysRange ? formData.workoutDaysRange.join(" - ") : "1 - 7"} days
          </div>
        </div>
      </div>

      {/* Question 4: Workout Time*/}
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          How much time a day do you have to work out? (in minutes)
        </label>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <Slider
            value={formData.workoutTimeRange || [30, 120]}
            onChange={(e, value) => handleChange({ target: { name: "workoutTimeRange", value } })}
            step={15}
            marks={[
              { value: 30, label: "30" },
              { value: 45, label: "45" },
              { value: 60, label: "60" },
              { value: 75, label: "75" },
              { value: 90, label: "90" },
              { value: 105, label: "105" },
              { value: 120, label: "120+" },
            ]}
            min={30}
            max={120}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-markLabel": {
                textAlign: "center",
                fontSize: "12px",
                color: "text.secondary",
              },
            }}
          />
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
            Selected Range:{" "}
            {formData.workoutTimeRange
              ? `${formData.workoutTimeRange[0]} min - ${
                  formData.workoutTimeRange[1] === 120 ? "2h+" : `${formData.workoutTimeRange[1]} min`
                }`
              : "30 min - 2h+"}
          </div>
        </div>
      </div>

      {/* Question 5: Obstacles*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>
          What is your current obstacle in reaching your goal? Select all that apply:
        </legend>
        <FormGroup>
          {[
            "Lack of consistency",
            "Not seeing progress",
            "Lack of fitness knowledge",
            "Lack of accountability",
            "Stress or other life factors",
            "Health issues or injuries",
          ].map((obstacle) => (
            <FormControlLabel
              key={obstacle}
              control={
                <Checkbox
                  name="obstacles"
                  value={obstacle}
                  onChange={handleCheckboxChange}
                  checked={formData.obstacles.includes(obstacle)}
                />
              }
              label={obstacle}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="obstaclesOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    obstaclesOtherChecked: e.target.checked,
                    obstaclesOther: e.target.checked ? formData.obstaclesOther : "",
                  })
                }
                checked={!!formData.obstaclesOtherChecked}
              />
            }
            label={
              <TextField
                name="obstaclesOther"
                value={formData.obstaclesOther || ""}
                onChange={handleChange}
                placeholder="Other"
                disabled={!formData.obstaclesOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>

      {/* Question 6: Preferred Workouts*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>
          What type of workouts do you prefer? Select all that apply:
        </legend>
        <FormGroup>
          {["Strength training", "HIIT", "Yoga", "Running", "Biking", "Swimming"].map((workout) => (
            <FormControlLabel
              key={workout}
              control={
                <Checkbox
                  name="preferredWorkouts"
                  value={workout}
                  onChange={handleCheckboxChange}
                  checked={formData.preferredWorkouts.includes(workout)}
                />
              }
              label={workout}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="preferredWorkoutsOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredWorkoutsOtherChecked: e.target.checked,
                    preferredWorkoutsOther: e.target.checked ? formData.preferredWorkoutsOther : "",
                  })
                }
                checked={!!formData.preferredWorkoutsOtherChecked}
              />
            }
            label={
              <TextField
                name="preferredWorkoutsOther"
                value={formData.preferredWorkoutsOther || ""}
                onChange={handleChange}
                placeholder="Other"
                disabled={!formData.preferredWorkoutsOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>

      {/* Question 7: Motivations*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>
          What motivates you most in your fitness journey? Select all that apply:
        </legend>
        <FormGroup>
          {[
            "Progress tracking",
            "Social accountability",
            "Achieving milestones",
            "Improving physical health",
            "Mental health benefits",
            "Appearance goals",
            "Performance goals",
            "Competing in events",
            "Building habits/discipline",
            "Social interaction/community",
            "Longevity and aging well",
            "Learning new skills"
          ].map((motivation) => (
            <FormControlLabel
              key={motivation}
              control={
                <Checkbox
                  name="motivations"
                  value={motivation}
                  onChange={handleCheckboxChange}
                  checked={formData.motivations.includes(motivation)}
                />
              }
              label={motivation}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="motivationsOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    motivationsOtherChecked: e.target.checked,
                    motivationsOther: e.target.checked ? formData.motivationsOther : "",
                  })
                }
                checked={!!formData.motivationsOtherChecked}
              />
            }
            label={
              <TextField
                name="motivationsOther"
                value={formData.motivationsOther || ""}
                onChange={handleChange}
                placeholder="Other"
                disabled={!formData.motivationsOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>
    </Box>,

    <Box key="section3" sx={commonBoxStyles}>
      {/* Section 3: Fitness Baseline*/}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Fitness Baseline</h2>

      {/* Question 1: Current Workout Days & Time*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>How many days do you currently work out, and for how long?</legend>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                name="currentWorkoutNone"
                checked={formData.currentWorkoutNone || false}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    currentWorkoutNone: e.target.checked,
                    currentWorkoutDaysRange: e.target.checked ? [0, 0] : prevData.currentWorkoutDaysRange || [1, 7],
                    currentWorkoutTimeRange: e.target.checked ? [0, 0] : prevData.currentWorkoutTimeRange || [15, 120],
                  }))
                }
              />
            }
            label="I don't work out"
          />
        </FormGroup>

        {!formData.currentWorkoutNone && (
          <>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Days per week:
              </label>
              <Slider
                value={formData.currentWorkoutDaysRange || [1, 7]}
                onChange={(e, value) => handleChange({ target: { name: "currentWorkoutDaysRange", value } })}
                step={1}
                marks={[
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: "5" },
                  { value: 6, label: "6" },
                  { value: 7, label: "7" },
                ]}
                min={1}
                max={7}
                valueLabelDisplay="auto"
                sx={{
                  "& .MuiSlider-markLabel": {
                    textAlign: "center",
                    fontSize: "12px",
                    color: "text.secondary",
                  },
                }}
              />
              <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
                Selected Range: {formData.currentWorkoutDaysRange ? formData.currentWorkoutDaysRange.join(" - ") : "1 - 7"} days
              </div>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                Time per session (minutes):
              </label>
              <Slider
                value={formData.currentWorkoutTimeRange || [15, 120]}
                onChange={(e, value) => handleChange({ target: { name: "currentWorkoutTimeRange", value } })}
                step={15}
                marks={[
                  { value: 15, label: "15" },
                  { value: 30, label: "30" },
                  { value: 45, label: "45" },
                  { value: 60, label: "60" },
                  { value: 75, label: "75" },
                  { value: 90, label: "90" },
                  { value: 105, label: "105" },
                  { value: 120, label: "120+" },
                ]}
                min={15}
                max={120}
                valueLabelDisplay="auto"
                sx={{
                  "& .MuiSlider-markLabel": {
                    textAlign: "center",
                    fontSize: "12px",
                    color: "text.secondary",
                  },
                }}
              />
              <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
                Selected Range:{" "}
                {formData.currentWorkoutTimeRange
                  ? `${formData.currentWorkoutTimeRange[0]} min - ${
                      formData.currentWorkoutTimeRange[1] === 120 ? "2 hrs" : `${formData.currentWorkoutTimeRange[1]} min`
                    }`
                  : "15 min - 2 hrs"}
              </div>
            </div>
          </>
        )}
      </fieldset>

      {/* Question 2: Fitness Level*/}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          How would you rate your fitness level (1=Beginner, 5=Advanced)?
        </label>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <Slider
            name="fitnessLevel"
            value={formData.fitnessLevel || 3}
            onChange={(e, value) => handleChange({ target: { name: "fitnessLevel", value } })}
            step={1}
            marks={[
              { value: 1, label: "1 (Beginner)" },
              { value: 2, label: "2" },
              { value: 3, label: "3 (Intermediate)" },
              { value: 4, label: "4" },
              { value: 5, label: "5 (Advanced)" },
            ]}
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              "& .MuiSlider-markLabel": {
                textAlign: "center",
                fontSize: "12px",
                color: "text.secondary",
              },
            }}
          />
          <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
            Selected Level: {formData.fitnessLevel ? formData.fitnessLevel : "3 (Intermediate)"}
          </div>
        </div>
      </div>

      {/*Question 3: Pull-Ups*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Let's assess your baseline fitness:</legend>
        <div style={{ marginTop: "10px" }}>
          <div style={{ marginBottom: "20px" }}>
            <TextField
              select
              name="pullUps"
              label="How many unbroken strict pull-ups can you do?"
              value={formData.pullUps || "None"}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="1-3">1-3</MenuItem>
              <MenuItem value="5-10">5-10</MenuItem>
              <MenuItem value="10+">10+</MenuItem>
            </TextField>
          </div>

          // Question 4: Push-Ups
          <div style={{ marginBottom: "20px" }}>
            <TextField
              select
              name="pushUps"
              label="How many unbroken push-ups can you do?"
              value={formData.pushUps || "None"}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="1-5">1-5</MenuItem>
              <MenuItem value="10-20">10-20</MenuItem>
              <MenuItem value="20+">20+</MenuItem>
            </TextField>
          </div>
          
          {/* Question 5: Cardio Frequency*/}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
              How often do you do cardio per week?
            </label>
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
              <Slider
                name="cardioFrequency"
                value={formData.cardioFrequency || 0}
                onChange={(e, value) =>
                  handleChange({ target: { name: "cardioFrequency", value } })
                }
                step={1}
                marks={[
                  { value: 0, label: "No Cardio" },
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                  { value: 4, label: "4" },
                  { value: 5, label: "5" },
                  { value: 6, label: "6" },
                  { value: 7, label: "7" },
                ]}
                min={0}
                max={7}
                valueLabelDisplay="auto"
                sx={{
                  "& .MuiSlider-markLabel": {
                    textAlign: "center",
                    fontSize: "12px",
                    color: "text.secondary",
                  },
                }}
              />
            </div>
          </div>

          {/* Question 6: Cardio Type*/}
          {formData.cardioFrequency > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <FormGroup>
                <label style={{ fontWeight: "bold" }}>What is your cardio of choice?</label>
                {["Run", "Swim", "Bike", "Row"].map((activity) => (
                  <FormControlLabel
                    key={activity}
                    control={
                      <Checkbox
                        name="cardioType"
                        value={activity}
                        onChange={handleCheckboxChange}
                        checked={formData.cardioType.includes(activity)}
                      />
                    }
                    label={activity}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="cardioOtherChecked"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cardioOtherChecked: e.target.checked,
                          cardioOther: e.target.checked ? formData.cardioOther : "",
                        })
                      }
                      checked={!!formData.cardioOtherChecked}
                    />
                  }
                  label={
                    <TextField
                      name="cardioOther"
                      value={formData.cardioOther || ""}
                      onChange={handleChange}
                      placeholder="Other (please specify)"
                      fullWidth
                      disabled={!formData.cardioOtherChecked}
                    />
                  }
                />
              </FormGroup>
            </div>
          )}

          {/*  Question 7: Cardio Duration*/}
          {formData.cardioFrequency > 0 && (
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                How long are your cardio sessions?
              </label>
              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <Slider
                  name="cardioDuration"
                  value={formData.cardioDuration || [15, 120]}
                  onChange={(e, value) =>
                    handleChange({ target: { name: "cardioDuration", value } })
                  }
                  step={15}
                  marks={[
                    { value: 15, label: "15" },
                    { value: 30, label: "30" },
                    { value: 45, label: "45" },
                    { value: 60, label: "60" },
                    { value: 75, label: "75" },
                    { value: 90, label: "90" },
                    { value: 105, label: "105" },
                    { value: 120, label: "120+" },
                  ]}
                  min={15}
                  max={120}
                  valueLabelDisplay="auto"
                  sx={{
                    "& .MuiSlider-markLabel": {
                      textAlign: "center",
                      fontSize: "12px",
                      color: "text.secondary",
                    },
                  }}
                />
                <div style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
                  Selected Range:{" "}
                  {formData.cardioDuration
                    ? `${formData.cardioDuration[0]} min - ${
                        formData.cardioDuration[1] === 120
                          ? "2h+"
                          : `${formData.cardioDuration[1]} min`
                      }`
                    : "15 min - 2h+"}
                </div>
              </div>
            </div>
          )}

          {/*  Question 8: Flexibility*/}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
              How would you rate your flexibility/mobility (1=Limited, 5=Excellent)?
            </label>
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>
              <Slider
                name="flexibility"
                value={formData.flexibility || 3}
                onChange={(e, value) =>
                  handleChange({ target: { name: "flexibility", value } })
                }
                step={1}
                marks={[
                  { value: 1, label: <span>1<br /><small>Beginner</small></span> },
                  { value: 2, label: "2" },
                  { value: 3, label: <span>3<br /><small>Intermediate</small></span> },
                  { value: 4, label: "4" },
                  { value: 5, label: <span>5<br /><small>Advanced</small></span> },
                ]}
                min={1}
                max={5}
                valueLabelDisplay="auto"
                sx={{
                  "& .MuiSlider-markLabel": {
                    textAlign: "center",
                    fontSize: "12px",
                    color: "text.secondary",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </Box>,

    <Box key="section4" sx={commonBoxStyles}>
      {/* Section 4: Gym & Equipment */}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Gym & Equipment</h2>

      {/* Question 1: Workout Locations*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Where do you workout (or intend to workout)? Select all that apply:</legend>
        <FormGroup>
          {["Home", "Commercial Gym", "Specialized Gym", "Other"].map((location) => (
            <FormControlLabel
              key={location}
              control={
                <Checkbox
                  name="workoutLocations"
                  value={location}
                  onChange={handleCheckboxChange}
                  checked={formData.workoutLocations.includes(location)}
                />
              }
              label={location}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="specializedGymTypeChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specializedGymTypeChecked: e.target.checked,
                    specializedGymType: e.target.checked ? formData.specializedGymType : "",
                  })
                }
                checked={!!formData.specializedGymTypeChecked}
              />
            }
            label={
              <TextField
                name="specializedGymType"
                value={formData.specializedGymType || ""}
                onChange={handleChange}
                placeholder="If specialized gym, specify"
                disabled={!formData.specializedGymTypeChecked}
                fullWidth
              />
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                name="workoutLocationsOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workoutLocationsOtherChecked: e.target.checked,
                    workoutLocationsOther: e.target.checked ? formData.workoutLocationsOther : "",
                  })
                }
                checked={!!formData.workoutLocationsOtherChecked}
              />
            }
            label={
              <TextField
                name="workoutLocationsOther"
                value={formData.workoutLocationsOther || ""}
                onChange={handleChange}
                placeholder="If Other, please specify"
                disabled={!formData.workoutLocationsOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>

      {/* Question 2: Equipment*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Please check which equipment you have access to when working out:</legend>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Strength Training</h3>
          <FormGroup>
            {[
              "Dumbbells",
              "Kettlebells",
              "Barbells",
              "Weight Plates",
              "Adjustable Bench",
              "Squat Rack or Power Cage",
              "Resistance Bands",
              "Pull-Up Bar",
              "Medicine Ball",
              "Sandbag",
              "Weight Vest",
            ].map((equipment) => (
              <FormControlLabel
                key={equipment}
                control={
                  <Checkbox
                    name="equipmentStrength"
                    value={equipment}
                    onChange={handleCheckboxChange}
                    checked={formData.equipmentStrength.includes(equipment)}
                  />
                }
                label={equipment}
              />
            ))}
            <FormControlLabel
              control={
                <Checkbox
                  name="equipmentStrengthOtherChecked"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipmentStrengthOtherChecked: e.target.checked,
                      equipmentStrengthOther: e.target.checked ? formData.equipmentStrengthOther : "",
                    })
                  }
                  checked={!!formData.equipmentStrengthOtherChecked}
                />
              }
              label={
                <TextField
                  name="equipmentStrengthOther"
                  value={formData.equipmentStrengthOther || ""}
                  onChange={handleChange}
                  placeholder="Other (please specify)"
                  fullWidth
                  disabled={!formData.equipmentStrengthOtherChecked}
                  multiline
                  rows={2}
                  sx={{ marginTop: "10px" }}
                />
              }
            />
          </FormGroup>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Cardio Equipment</h3>
          <FormGroup>
            {[
              "Treadmill",
              "Stationary Bike",
              "Rowing Machine",
              "Elliptical",
              "Stair Climber",
              "Jump Rope",
            ].map((equipment) => (
              <FormControlLabel
                key={equipment}
                control={
                  <Checkbox
                    name="equipmentCardio"
                    value={equipment}
                    onChange={handleCheckboxChange}
                    checked={formData.equipmentCardio.includes(equipment)}
                  />
                }
                label={equipment}
              />
            ))}
            <FormControlLabel
              control={
                <Checkbox
                  name="equipmentCardioOtherChecked"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipmentCardioOtherChecked: e.target.checked,
                      equipmentCardioOther: e.target.checked ? formData.equipmentCardioOther : "",
                    })
                  }
                  checked={!!formData.equipmentCardioOtherChecked}
                />
              }
              label={
                <TextField
                  name="equipmentCardioOther"
                  value={formData.equipmentCardioOther || ""}
                  onChange={handleChange}
                  placeholder="Other (please specify)"
                  fullWidth
                  disabled={!formData.equipmentCardioOtherChecked}
                  multiline
                  rows={2}
                  sx={{ marginTop: "10px" }}
                />
              }
            />
          </FormGroup>
        </div>

        <div>
          <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>Bodyweight Training or Mobility</h3>
          <FormGroup>
            {[
              "Yoga Mat",
              "Foam Roller",
              "Stability Ball",
              "TRX or Suspension Trainer",
              "Yoga Blocks",
              "Stretch Bands",
            ].map((equipment) => (
              <FormControlLabel
                key={equipment}
                control={
                  <Checkbox
                    name="equipmentMobility"
                    value={equipment}
                    onChange={handleCheckboxChange}
                    checked={formData.equipmentMobility.includes(equipment)}
                  />
                }
                label={equipment}
              />
            ))}
            <FormControlLabel
              control={
                <Checkbox
                  name="equipmentMobilityOtherChecked"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipmentMobilityOtherChecked: e.target.checked,
                      equipmentMobilityOther: e.target.checked ? formData.equipmentMobilityOther : "",
                    })
                  }
                  checked={!!formData.equipmentMobilityOtherChecked}
                />
              }
              label={
                <TextField
                  name="equipmentMobilityOther"
                  value={formData.equipmentMobilityOther || ""}
                  onChange={handleChange}
                  placeholder="Other (please specify)"
                  fullWidth
                  disabled={!formData.equipmentMobilityOtherChecked}
                  multiline
                  rows={2}
                  sx={{ marginTop: "10px" }}
                />
              }
            />
          </FormGroup>
        </div>
      </fieldset>

      {/* Question 3: Fitness Trackers*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Which fitness tracker(s) do you have?</legend>
        <FormGroup>
          {[
            "I don't have a fitness tracker",
            "Garmin",
            "Apple Watch",
            "Fitbit/Google Watch",
            "Oura",
            "Whoop",
          ].map((tracker) => (
            <FormControlLabel
              key={tracker}
              control={
                <Checkbox
                  name="fitnessTrackers"
                  value={tracker}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    setFormData((prevState) => {
                      const updatedTrackers = checked
                        ? [...(prevState.fitnessTrackers || []), value]
                        : prevState.fitnessTrackers.filter((item) => item !== value);
                      return { ...prevState, fitnessTrackers: updatedTrackers };
                    });
                  }}
                  checked={formData.fitnessTrackers?.includes(tracker)}
                />
              }
              label={tracker}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="fitnessTrackersOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fitnessTrackersOtherChecked: e.target.checked,
                    fitnessTrackersOther: e.target.checked ? formData.fitnessTrackersOther : "",
                  })
                }
                checked={!!formData.fitnessTrackersOtherChecked}
              />
            }
            label={
              <TextField
                name="fitnessTrackersOther"
                value={formData.fitnessTrackersOther || ""}
                onChange={handleChange}
                placeholder="Other (please specify)"
                disabled={!formData.fitnessTrackersOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>
    </Box>,

    <Box key="section5" sx={commonBoxStyles}>
      {/* Section 5: Risks & Injuries */}
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Risks & Injuries</h2>

      {/* Question 1: Injuries*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Do you have any injuries at the moment?</legend>
        <FormGroup>
          <FormControlLabel
            control={
              <Radio
                name="hasInjuries"
                value="Yes"
                onChange={handleChange}
                checked={formData.hasInjuries === "Yes"}
              />
            }
            label="Yes"
          />
          <FormControlLabel
            control={
              <Radio
                name="hasInjuries"
                value="No"
                onChange={handleChange}
                checked={formData.hasInjuries === "No"}
              />
            }
            label="No"
          />
        </FormGroup>

        {formData.hasInjuries === "Yes" && (
          <Box sx={{ marginTop: "20px" }}>
            <fieldset style={{ border: "none" }}>
              <legend style={{ fontWeight: "bold" }}>Where is your injury? (Check all that apply)</legend>
              <FormGroup>
                {["Knee", "Back", "Shoulder", "Ankle", "Wrist"].map((injury) => (
                  <FormControlLabel
                    key={injury}
                    control={
                      <Checkbox
                        name="injuryLocations"
                        value={injury}
                        onChange={handleCheckboxChange}
                        checked={formData.injuryLocations?.includes(injury)}
                      />
                    }
                    label={injury}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="injuryLocations"
                      value="Other"
                      onChange={handleCheckboxChange}
                      checked={formData.injuryLocations?.includes("Other")}
                    />
                  }
                  label={
                    <TextField
                      name="injuryLocationsOther"
                      value={formData.injuryLocationsOther || ""}
                      onChange={handleChange}
                      placeholder="Specify other injury"
                      disabled={!formData.injuryLocations?.includes("Other")}
                      sx={{ marginLeft: "10px" }}
                      fullWidth
                    />
                  }
                />
              </FormGroup>
            </fieldset>
          </Box>
        )}
      </fieldset>

      {/* Question 2: Health Risks*/}
      <fieldset style={{ marginBottom: "30px", border: "none" }}>
        <legend style={{ fontWeight: "bold" }}>Do you have any known health risks? (Check all that apply)</legend>
        <FormGroup>
          {[
            "Cardiovascular issues (e.g., heart disease)",
            "High blood pressure (hypertension)",
            "Diabetes (Type 1 or Type 2)",
            "Asthma or respiratory issues",
            "Chronic joint pain or arthritis",
            "Osteoporosis",
            "Neurological disorders (e.g., epilepsy)",
            "Chronic fatigue syndrome",
            "Autoimmune diseases (e.g., lupus, MS)",
            "Mental health conditions (e.g., anxiety, depression)",
          ].map((risk) => (
            <FormControlLabel
              key={risk}
              control={
                <Checkbox
                  name="healthRisks"
                  value={risk}
                  onChange={handleCheckboxChange}
                  checked={formData.healthRisks?.includes(risk)}
                />
              }
              label={risk}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                name="healthRisksOtherChecked"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthRisksOtherChecked: e.target.checked,
                    healthRisksOther: e.target.checked ? formData.healthRisksOther : "",
                  })
                }
                checked={!!formData.healthRisksOtherChecked}
              />
            }
            label={
              <TextField
                name="healthRisksOther"
                value={formData.healthRisksOther || ""}
                onChange={handleChange}
                placeholder="Other"
                disabled={!formData.healthRisksOtherChecked}
                fullWidth
              />
            }
          />
        </FormGroup>
      </fieldset>
    </Box>,
  ];

  const validateCurrentSection = () => {
    switch (localSection) {
      case 0:
        return (
          formData.preferredName.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.age > 0 &&
          formData.sex.trim() !== ""
        );
      case 1:
        return (
          formData.fitnessGoalScale !== null &&
          // formData.events.length > 0 &&
          formData.workoutDays > 0 &&
          formData.workoutTime > 0
        );
      // case 2:
      //   return (
      //     formData.fitnessLevel > 0 &&
      //     formData.flexibility > 0 &&
      //     (formData.currentWorkoutNone || (formData.currentWorkoutDays > 0 && formData.currentWorkoutTime > 0))
      //   );
      case 3:
        return formData.workoutLocations.length > 0;
      case 4:
        if (formData.hasInjuries === "Yes") {
          return (
            formData.injuryLocations.length > 0 &&
            (!formData.injuryLocationsOtherChecked || (formData.injuryLocationsOther || "").trim() !== "")
          );
        }
        return formData.hasInjuries !== "";
      default:
        return true;
    }
  };

  return (
    <div>
      {!user ? (
        <p>Please log in to access the questionnaire.</p>
      ) : (
        <form>
          <div style={{ margin: "20px 0" }}>
            <progress value={((localSection + 1) / sections.length) * 100} max="100"></progress>
            <span>{Math.round(((localSection + 1) / sections.length) * 100)}% Complete</span>
          </div>

          {sections[localSection]}

          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "20px",
            marginTop: "20px",
            marginBottom: "20px"
          }}>
            {localSection > 0 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setLocalSection((prev) => Math.max(prev - 1, 0))}
              >
                Back
              </Button>
            )}
            {localSection < sections.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setLocalSection((prev) => prev + 1)}
                disabled={!validateCurrentSection()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={(e) => handleSubmitQuestionnaire(e)}
                disabled={!validateCurrentSection()}
              >
                Submit
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Questionnaire;

