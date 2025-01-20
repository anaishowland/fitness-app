require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateWorkoutPlan(userData) {
  try {
    console.log("Starting generateWorkoutPlan function");
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Prepare user equipment in text
    const strengthEquipment = userData.equipmentStrength?.join(", ") || "None";
    const cardioEquipment = userData.equipmentCardio?.join(", ") || "None";
    const mobilityEquipment = userData.equipmentMobility?.join(", ") || "None";

    const apiRequest = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fitness assistant that strictly outputs JSON. Never include Markdown, plain text, or explanations."
        },
        {
          role: "user",
          content: `
  Generate a structured 7-day workout plan for ${userData.preferredName}. 
  This is all the information about the user:

  START OF USER INFORMATION
  **User Profile**:
  - Name: ${userData.preferredName}
  - Age: ${userData.age}
  - Sex: ${userData.sex}
  - Fitness Goal: ${userData.fitnessGoalScale === 1 ? "Build Strength" : "Build Cardio"}
  - Days available: ${userData.workoutDaysRange ? userData.workoutDaysRange.join(" to ") : userData.workoutDays} days/week
  - Time available per session: ${userData.workoutTimeRange ? userData.workoutTimeRange.join(" to ") : userData.workoutTime} minutes
  - Preferred workout types: ${userData.preferredWorkouts.join(", ") || "None"}

  **Current Fitness Level**:
  - Current workout days: ${userData.currentWorkoutDaysRange?.join(" to ") || "N/A"} days/week
  - Current session duration: ${userData.currentWorkoutTimeRange?.join(" to ") || "N/A"} minutes
  - Current Fitness Level: ${userData.fitnessLevel}/5
  - Pull-ups capability: ${userData.pullUps}
  - Push-ups capability: ${userData.pushUps}
  - Cardio frequency: ${userData.cardioFrequency}
  - Cardio duration: ${userData.cardioDuration ? userData.cardioDuration.join(" to ") : "N/A"} minutes
  - Cardio type: ${userData.cardioType.join(", ") || "None"}
  - Flexibility/Mobility rating: ${userData.flexibility}/5

  **Available Equipment**:
  - Strength: ${strengthEquipment}
  - Cardio: ${cardioEquipment}
  - Mobility: ${mobilityEquipment}
  - Other equipment: ${userData.equipmentStrengthOther || userData.equipmentCardioOther || userData.equipmentMobilityOther || "None"}

  **Additional Information**:
  - Motivations: ${userData.motivations.join(", ") || "None"}
  - Obstacles: ${userData.obstacles.join(", ") || "None"}
  - Injuries: ${userData.injuryLocations.join(", ") || "None"}
  - Known health risks: ${userData.healthRisks.join(", ") || "None"}
  - Fitness tracker(s): ${userData.fitnessTrackers.join(", ") || "None"}
END OF USER INFORMATION

Please create a structured 7-day workout plan with the following format for each day:

For each day (Day 1-7), provide:
1. Focus: Main focus of the workout
2. Estimated Time: Total workout duration
3. Warmup: List of exercises with sets, reps, and notes
4. Workout: Main exercises with sets, reps, and weight tracking
5. Cooldown: Stretches and mobility work


Return a workout plan using valid JSON ONLY, with the following schema. Don't return anything else because I will parse this response.

{
  "days": [
    {
      "dayNumber": 1,
      "focus": "string",
      "estimatedTime": "string",
      "warmup": [
        {
          "name": "string",
          "sets": number,
          "reps": "string",
          "notes": "string"
        }
      ],
      "workout": [
        {
          "name": "string",
          "sets": number,
          "reps": "string",
          "notes": "string",
          "weightTracking": boolean
        }
      ],
      "cooldown": [
        {
          "name": "string",
          "duration": "string",
          "notes": "string"
        }
      ]
    }
  ]
}

Only return your response in the JSON format described above.
`
        }
      ],
      functions: [
        {
          name: "return_workout_plan",
          description: "Return the user's 7-day workout plan strictly as JSON",
          parameters: {
            type: "object",
            properties: {
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    dayNumber: { type: "number" },
                    focus: { type: "string" },
                    estimatedTime: { type: "string" },
                    warmup: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "number" },
                          reps: { type: "string" },
                          notes: { type: "string" }
                        },
                        required: ["name", "sets", "reps", "notes"]
                      }
                    },
                    workout: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "number" },
                          reps: { type: "string" },
                          notes: { type: "string" },
                          weightTracking: { type: "boolean" }
                        },
                        required: ["name", "sets", "reps", "notes", "weightTracking"]
                      }
                    },
                    cooldown: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          duration: { type: "string" },
                          notes: { type: "string" }
                        },
                        required: ["name", "duration", "notes"]
                      }
                    }
                  },
                  required: ["dayNumber", "focus", "estimatedTime", "warmup", "workout", "cooldown"]
                }
              }
            },
            required: ["days"]
          }
        }
      ],
      function_call: { name: "return_workout_plan" },
      temperature: 0.7
    };

    console.log("About to send request to OpenAI:", JSON.stringify(apiRequest, null, 2));
    
    const response = await openai.chat.completions.create(apiRequest);
    console.log("Raw OpenAI response received:", JSON.stringify(response, null, 2));

    // Create a safe-to-serialize version of the response
    const safeResponse = {
      apiRequest: apiRequest,
      rawResponse: response,
      workoutPlan: response.choices[0].message.function_call 
        ? JSON.parse(response.choices[0].message.function_call.arguments)
        : response.choices[0].message.content
    };

    console.log("Returning safe response:", JSON.stringify(safeResponse, null, 2));

    return safeResponse;

  } catch (error) {
    console.error("Error in generateWorkoutPlan:", error);
    throw error;
  }
}

module.exports = generateWorkoutPlan;