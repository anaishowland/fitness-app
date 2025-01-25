const express = require("express");
const cors = require("cors");
const generateWorkoutPlan = require("./generateWorkout");
const openai = require("./openai");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate-workout", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    
    if (!req.body) {
      throw new Error("No request body received");
    }

    const userData = req.body;
    console.log("Processing user data:", JSON.stringify(userData, null, 2));
    
    // Get the full response from generateWorkoutPlan
    const response = await generateWorkoutPlan(userData);
    
    // Log the complete response before sending
    console.log("Complete response from generateWorkoutPlan:", JSON.stringify(response, null, 2));

    // Add scheduled dates if they don't exist
    if (response.workoutPlan && response.workoutPlan.days) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      response.workoutPlan.days = response.workoutPlan.days.map((day, index) => {
        if (!day.scheduledDate) {
          const scheduledDate = new Date(startDate);
          scheduledDate.setDate(startDate.getDate() + index);
          return {
            ...day,
            scheduledDate: scheduledDate.toISOString(),
            completed: false
          };
        }
        return day;
      });
    }
    
    // Explicitly structure the response
    const responseToClient = {
      apiRequest: response.apiRequest,
      rawResponse: response.rawResponse,
      workoutPlan: response.workoutPlan
    };

    console.log("Sending to client:", JSON.stringify(responseToClient, null, 2));
    
    // Send back the complete response object
    res.json(responseToClient);
    
  } catch (error) {
    console.error("Detailed error in /api/generate-workout:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Failed to generate workout plan",
      details: error.message 
    });
  }
});

// New endpoint to handle workout plan feedback and updates
app.post("/api/update-workout", async (req, res) => {
  try {
    const { userId, currentPlan, feedback, updateType, selectedDay } = req.body;

    if (!userId || !currentPlan || !feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Received update request:', {
      updateType,
      selectedDay,
      feedback: feedback.substring(0, 100) + '...' // Log truncated feedback
    });

    // Prepare the system message based on update type
    let systemMessage = `You are a professional fitness trainer. You will ${
      updateType === 'single' ? 'update a single workout day' : 'update an entire week of workouts'
    } based on user feedback. 
    
    Important Guidelines:
    1. Provide DETAILED exercise descriptions including form cues and specific movements
    2. Include clear sets, reps, and rest periods
    3. Add specific notes about form and technique
    4. Maintain the same structure for each day's workout (warmup, workout, cooldown)

    Your response must be a valid JSON object with this exact structure:
    {
      "workoutPlan": {
        "days": [
          {
            "dayNumber": number,
            "focus": string,
            "estimatedTime": string,
            "warmup": [
              {
                "name": string (detailed exercise name),
                "sets": number,
                "reps": string,
                "notes": string (include form cues and specific movement instructions)
              }
            ],
            "workout": [
              {
                "name": string (detailed exercise name),
                "sets": number,
                "reps": string,
                "notes": string (include form cues, specific movement instructions, and rest periods),
                "weightTracking": boolean
              }
            ],
            "cooldown": [
              {
                "name": string (detailed exercise name),
                "duration": string,
                "notes": string (include form cues and specific movement instructions)
              }
            ]
          }
        ]
      }
    }`;

    if (updateType === 'single') {
      systemMessage += `\nFocus only on updating Day ${selectedDay}. Return only the updated day in the days array. Make sure to provide detailed exercise descriptions and form cues.`;
    }

    // Prepare the user message
    const userMessage = `
    Current plan: ${JSON.stringify(currentPlan.days, null, 2)}
    
    User feedback: ${feedback}
    
    ${updateType === 'single' 
      ? `Please update Day ${selectedDay} with more detailed exercise descriptions, form cues, and specific movement instructions. Return only the updated day in the days array.` 
      : 'Please update the entire week with more detailed exercise descriptions, form cues, and specific movement instructions.'}
    
    For each exercise:
    1. Provide clear, detailed names (e.g., "Barbell Back Squat" instead of just "Squats")
    2. Include specific form cues in the notes
    3. Specify exact movement patterns
    4. Add rest periods between sets
    5. Maintain the exact JSON structure as shown in the system message.`;

    const apiRequest = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    };

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create(apiRequest);
    console.log('Received response from OpenAI');

    let updatedPlan;
    try {
      // Parse the response content
      const responseContent = completion.choices[0].message.content;
      console.log('Raw OpenAI response:', responseContent);
      updatedPlan = JSON.parse(responseContent);
      
      // Validate the response structure
      if (!updatedPlan.workoutPlan || !Array.isArray(updatedPlan.workoutPlan.days)) {
        throw new Error('Response missing workoutPlan or days array');
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }

    // If updating a single day, merge it with the existing plan
    if (updateType === 'single' && selectedDay) {
      const updatedDay = updatedPlan.workoutPlan.days[0];
      if (!updatedDay || updatedDay.dayNumber !== selectedDay) {
        throw new Error('Updated day does not match selected day number');
      }

      updatedPlan.workoutPlan.days = currentPlan.days.map(day =>
        day.dayNumber === selectedDay ? updatedDay : day
      );
    }

    // Preserve scheduled dates and completion status
    updatedPlan.workoutPlan.days = updatedPlan.workoutPlan.days.map((day, index) => ({
      ...day,
      scheduledDate: currentPlan.days[index]?.scheduledDate || day.scheduledDate,
      completed: currentPlan.days[index]?.completed || false
    }));

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ 
      error: 'Failed to update workout plan', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
