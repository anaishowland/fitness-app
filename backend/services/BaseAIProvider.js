class BaseAIProvider {
  constructor(config) {
    this.config = config;
  }

  async generateWorkoutPlan(userData) {
    throw new Error('generateWorkoutPlan must be implemented by the provider');
  }

  async updateWorkoutPlan(currentPlan, feedback, updateType, selectedDay) {
    throw new Error('updateWorkoutPlan must be implemented by the provider');
  }

  prepareSystemMessage(isUpdate = false, updateType = null, selectedDay = null) {
    const baseMessage = `You are a professional fitness trainer. You will ${
      isUpdate 
        ? updateType === 'single' 
          ? 'update a single workout day' 
          : 'update an entire week of workouts'
        : 'create a new workout plan'
    }. 
    
    Important Guidelines:
    1. Provide DETAILED exercise descriptions including form cues and specific movements
    2. Include clear sets, reps, and rest periods
    3. Add specific notes about form and technique
    4. Maintain the same structure for each day's workout (warmup, workout, cooldown)
    5. ALWAYS include video demonstration URLs from YouTube for each exercise
       - URLs must be in the format: https://www.youtube.com/watch?v=VIDEO_ID
       - Use videos from reputable channels like AthleanX, Squat University, Alan Thrall, Jeff Nippard
       - Example: https://www.youtube.com/watch?v=q2mcy0MLXuk for barbell squats

    Your response must be a valid JSON object with this exact structure:
    {
      "workoutPlan": {
        "days": [
          {
            "dayNumber": number,
            "focus": string,
            "estimatedTime": string,
            "targetedGoal": string,
            "intensityLevel": string,
            "warmup": [
              {
                "name": string (detailed exercise name),
                "sets": number,
                "reps": string,
                "notes": string (include form cues and specific movement instructions),
                "videoUrl": string (MUST be a valid YouTube URL in the format https://www.youtube.com/watch?v=VIDEO_ID),
                "equipment": string (comma-separated list),
                "restPeriod": string,
                "modifications": string (newline-separated list),
                "injuryConsiderations": string (optional)
              }
            ],
            "workout": [
              {
                "name": string (detailed exercise name),
                "sets": number,
                "reps": string,
                "notes": string (include form cues, specific movement instructions, and rest periods),
                "videoUrl": string (MUST be a valid YouTube URL in the format https://www.youtube.com/watch?v=VIDEO_ID),
                "equipment": string (comma-separated list),
                "restPeriod": string,
                "modifications": string (newline-separated list),
                "injuryConsiderations": string (optional),
                "weightTracking": boolean (set to true for strength exercises that need weight tracking)
              }
            ],
            "cooldown": [
              {
                "name": string (detailed exercise name),
                "duration": string,
                "notes": string (include form cues and specific movement instructions),
                "videoUrl": string (MUST be a valid YouTube URL in the format https://www.youtube.com/watch?v=VIDEO_ID),
                "equipment": string (comma-separated list),
                "modifications": string (newline-separated list),
                "injuryConsiderations": string (optional)
              }
            ]
          }
        ]
      }
    }`;

    if (isUpdate && updateType === 'single') {
      return baseMessage + `\nFocus only on updating Day ${selectedDay}. Return only the updated day in the days array. Make sure to provide detailed exercise descriptions and form cues.`;
    }

    return baseMessage;
  }

  prepareUserMessage(userData, isUpdate = false) {
    if (isUpdate) {
      return `
      Current plan: ${JSON.stringify(userData.currentPlan.days, null, 2)}
      
      User feedback: ${userData.feedback}
      
      ${userData.updateType === 'single' 
        ? `Please update Day ${userData.selectedDay} with more detailed exercise descriptions, form cues, and specific movement instructions. Return only the updated day in the days array.` 
        : 'Please update the entire week with more detailed exercise descriptions, form cues, and specific movement instructions.'}`;
    }

    const workoutDays = userData.workoutDaysRange 
      ? `${userData.workoutDaysRange[0]}-${userData.workoutDaysRange[1]} (Program ${userData.workoutDaysRange[0]} intense workouts and ${userData.workoutDaysRange[1] - userData.workoutDaysRange[0]} easier/recovery sessions)`
      : userData.workoutDays;

    return `
    Generate a personalized ${workoutDays}-day workout plan for ${userData.preferredName}. 
    
    CRITICAL REQUIREMENTS:
    1. Primary Goal: ${userData.fitnessGoalScale === 1 ? "Build Strength" : userData.fitnessGoalScale === 2 ? "Hybrid Training" : "Build Cardio"}
    2. Workout Duration: ${userData.workoutTimeRange ? userData.workoutTimeRange.join("-") : userData.workoutTime} minutes (EXCLUDING cooldown)
    3. Days per Week: ${workoutDays}
    4. Experience Level: ${userData.fitnessLevel}/5 (provide appropriate scaling options)

    USER PROFILE:
    - Age: ${userData.age}
    - Sex: ${userData.sex}
    - Preferred workout types: ${userData.preferredWorkouts?.join(", ") || "None"}

    CURRENT FITNESS LEVEL:
    - Pull-ups capability: ${userData.pullUps}
    - Push-ups capability: ${userData.pushUps}
    - Cardio frequency: ${userData.cardioFrequency}
    - Cardio duration: ${userData.cardioDuration ? userData.cardioDuration.join(" to ") : "N/A"} minutes
    - Cardio type: ${userData.cardioType?.join(", ") || "None"}
    - Flexibility/Mobility: ${userData.flexibility}/5

    AVAILABLE EQUIPMENT:
    - Strength: ${userData.equipmentStrength?.join(", ") || "None"}
    - Cardio: ${userData.equipmentCardio?.join(", ") || "None"}
    - Mobility: ${userData.equipmentMobility?.join(", ") || "None"}

    HEALTH CONSIDERATIONS:
    - Injuries: ${userData.injuryLocations?.join(", ") || "None"}
    - Health risks: ${userData.healthRisks?.join(", ") || "None"}

    Each exercise must include:
    1. Detailed movement standards
    2. Specific form cues
    3. Video demonstration links
    4. Rest periods between sets
    5. Beginner-friendly modifications
    6. Clear intensity level (primary/accessory work)

    The workout plan should strictly follow the JSON structure provided in the system message.`;
  }

  validateResponse(response) {
    if (!response.workoutPlan || !Array.isArray(response.workoutPlan.days)) {
      throw new Error('Response missing workoutPlan or days array');
    }

    response.workoutPlan.days.forEach((day, index) => {
      // Validate day-level fields
      const requiredDayFields = ['focus', 'estimatedTime', 'targetedGoal', 'intensityLevel'];
      requiredDayFields.forEach(field => {
        if (!day[field]) {
          throw new Error(`Day ${index + 1} missing required field: ${field}`);
        }
      });

      // Validate exercises have required fields
      const validateExercise = (exercise, type) => {
        const requiredFields = ['name', 'notes', 'videoUrl', 'modifications'];
        requiredFields.forEach(field => {
          if (!exercise[field]) {
            throw new Error(`${type} exercise "${exercise.name}" missing required field: ${field}`);
          }
        });

        // Validate video URL
        if (!exercise.videoUrl || !exercise.videoUrl.includes('youtube.com/watch?v=')) {
          throw new Error(`${type} exercise "${exercise.name}" must have a valid YouTube URL`);
        }

        // Validate workout-specific fields
        if (type === 'Workout') {
          const workoutFields = ['sets', 'reps', 'restPeriod', 'equipment'];
          workoutFields.forEach(field => {
            if (!exercise[field]) {
              throw new Error(`${type} exercise "${exercise.name}" missing required field: ${field}`);
            }
          });
        }

        // Validate warmup-specific fields
        if (type === 'Warmup') {
          const warmupFields = ['sets', 'reps'];
          warmupFields.forEach(field => {
            if (!exercise[field]) {
              throw new Error(`${type} exercise "${exercise.name}" missing required field: ${field}`);
            }
          });
        }

        // Validate cooldown-specific fields
        if (type === 'Cooldown') {
          if (!exercise.duration) {
            throw new Error(`${type} exercise "${exercise.name}" missing required field: duration`);
          }
        }
      };

      day.warmup?.forEach(exercise => validateExercise(exercise, 'Warmup'));
      day.workout?.forEach(exercise => validateExercise(exercise, 'Workout'));
      day.cooldown?.forEach(exercise => validateExercise(exercise, 'Cooldown'));
    });

    return response;
  }

  addScheduledDates(workoutPlan) {
    if (workoutPlan && workoutPlan.days) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      workoutPlan.days = workoutPlan.days.map((day, index) => {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(startDate.getDate() + index);
        return {
          ...day,
          scheduledDate: scheduledDate.toISOString(),
          completed: false,
          completedDate: null
        };
      });
    }
    return workoutPlan;
  }
}

module.exports = BaseAIProvider; 