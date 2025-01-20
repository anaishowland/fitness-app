import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Radio,
} from '@mui/material';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [docId, setDocId] = useState(null);

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
          const doc = querySnapshot.docs[0];
          setDocId(doc.id);
          setFormData(doc.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'questionnaire-responses', docId), {
        ...formData,
        lastUpdated: new Date(),
        timestamp: new Date()
      });
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) {
    return <CircularProgress />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ padding: "20px", maxWidth: "600px", margin: "20px auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "background.paper" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Basic Info</h2>

      {/* Question 1: Preferred Name */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Preferred First Name:
        </label>
        <TextField
          name="preferredName"
          value={formData.preferredName || ''}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
      </div>

        {/* Question 2: Email */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
            Email Address:
          </label>
          <TextField
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            required
          />
        </div>

      {/* Question 3: Age */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Age:
        </label>
        <TextField
          name="age"
          type="number"
          value={formData.age || ''}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
      </div>

      {/* Question 4: Sex */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          Sex:
        </label>
        <TextField
          name="sex"
          select
          value={formData.sex || ''}
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

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      {/* Section 2: Fitness Goals */}
      <Box sx={{ padding: "20px", maxWidth: "600px", margin: "20px auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "background.paper" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Fitness Goals</h2>

        {/* Question 1: Fitness Goal Scale */}
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
            On a scale of 1 (Get Stronger) to 5 (Build Cardio), where do your goals lie?
          </label>
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            <Slider
              name="fitnessGoalScale"
              value={formData.fitnessGoalScale || 3}
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

        {/* Question 2: Events */}
        <fieldset style={{ marginBottom: "20px", border: "none" }}>
          <legend style={{ fontWeight: "bold" }}>Are you training for a specific event? Check all that apply:</legend>
          <FormGroup>
            {["No", "5k", "10k", "Half-Marathon", "Triathlon", "Spartan Race/Tough Mudder"].map((event) => (
              <FormControlLabel
                key={event}
                control={
                  <Checkbox
                    name="events"
                    value={event}
                    onChange={handleChange}
                    checked={formData.events?.includes(event) || false}
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

        {/* Question 3: Workout Days */}
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

        {/* Question 4: Workout Time */}
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

        {/* Question 5: Obstacles */}
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
                    onChange={handleChange}
                    checked={formData.obstacles?.includes(obstacle) || false}
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

        {/* Question 6: Preferred Workouts */}
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
                    onChange={handleChange}
                    checked={formData.preferredWorkouts?.includes(workout) || false}
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

        {/* Question 7: Motivations */}
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
                    onChange={handleChange}
                    checked={formData.motivations?.includes(motivation) || false}
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
      </Box>

      {/* Section 3: Fitness Baseline */}
      <Box sx={{ padding: "20px", maxWidth: "600px", margin: "20px auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "background.paper" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Fitness Baseline</h2>

        {/* Question 1: Current Workout Days & Time */}
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

        {/* Question 2: Fitness Level */}
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

        {/* Question 3: Pull-Ups */}
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

            {/* Question 4: Push-Ups */}
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
                <MenuItem value="5-15">5-15</MenuItem>
                <MenuItem value="15-25">15-25</MenuItem>
                <MenuItem value="25+">25+</MenuItem>
              </TextField>
            </div>

            {/* Question 5: Cardio Frequency */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                How many days per week do you do cardio?
              </label>
              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <Slider
                  name="cardioFrequency"
                  value={formData.cardioFrequency || 0}
                  onChange={(e, value) => handleChange({ target: { name: "cardioFrequency", value } })}
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

            {/* Question 6: Cardio Type */}
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
                          onChange={handleChange}
                          checked={formData.cardioType?.includes(activity) || false}
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

            {/* Question 7: Cardio Duration */}
            {formData.cardioFrequency > 0 && (
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                  How long are your cardio sessions?
                </label>
                <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                  <Slider
                    name="cardioDuration"
                    value={formData.cardioDuration || [15, 120]}
                    onChange={(e, value) => handleChange({ target: { name: "cardioDuration", value } })}
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
                          formData.cardioDuration[1] === 120 ? "2h+" : `${formData.cardioDuration[1]} min`
                        }`
                      : "15 min - 2h+"}
                  </div>
                </div>
              </div>
            )}

            {/* Question 8: Flexibility */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
                How would you rate your flexibility/mobility (1=Limited, 5=Excellent)?
              </label>
              <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                <Slider
                  name="flexibility"
                  value={formData.flexibility || 3}
                  onChange={(e, value) => handleChange({ target: { name: "flexibility", value } })}
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
      </Box>

      {/* Section 4: Gym & Equipment */}
      <Box sx={{ padding: "20px", maxWidth: "600px", margin: "20px auto", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", backgroundColor: "background.paper" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Gym & Equipment</h2>

        {/* Question 1: Workout Locations */}
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
                    onChange={handleChange}
                    checked={formData.workoutLocations?.includes(location) || false}
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

        {/* Question 2: Equipment */}
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
                      onChange={handleChange}
                      checked={formData.equipmentStrength?.includes(equipment) || false}
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
                      onChange={handleChange}
                      checked={formData.equipmentCardio?.includes(equipment) || false}
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
                      onChange={handleChange}
                      checked={formData.equipmentMobility?.includes(equipment) || false}
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

        {/* Question 3: Fitness Trackers */}
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
                    onChange={handleChange}
                    checked={formData.fitnessTrackers?.includes(tracker) || false}
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
      </Box>

      {/* Section 5: Risks & Injuries */}
      <Box
        sx={{
          padding: "20px",
          maxWidth: "600px",
          margin: "20px auto",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "background.paper",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Risks & Injuries</h2>

        {/* Question 1: Injuries */}
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
                          onChange={handleChange}
                          checked={formData.injuryLocations?.includes(injury) || false}
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
                        onChange={handleChange}
                        checked={formData.injuryLocations?.includes("Other") || false}
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

        {/* Question 2: Health Risks */}
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
                    onChange={handleChange}
                    checked={formData.healthRisks?.includes(risk) || false}
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
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, mb: 4, justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Save Changes
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/profile')}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfile; 