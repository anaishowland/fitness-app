require("dotenv").config();
const OpenAI = require("openai");
const AIProviderFactory = require('./services/AIProviderFactory');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateWorkoutPlan(userData) {
  try {
    const provider = AIProviderFactory.getProvider();
    return await provider.generateWorkoutPlan(userData);
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
}

async function updateWorkoutPlan(currentPlan, feedback, updateType = 'full', selectedDay = null) {
  try {
    const provider = AIProviderFactory.getProvider();
    return await provider.updateWorkoutPlan(currentPlan, feedback, updateType, selectedDay);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    throw error;
  }
}

module.exports = {
  generateWorkoutPlan,
  updateWorkoutPlan
};