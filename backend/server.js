const express = require("express");
const cors = require("cors");
const generateWorkoutPlan = require("./generateWorkout");

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
