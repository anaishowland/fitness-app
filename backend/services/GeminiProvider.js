const { GoogleGenerativeAI } = require("@google/generative-ai");
const BaseAIProvider = require('./BaseAIProvider');

class GeminiProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({ model: config.model });
  }

  async generateWorkoutPlan(userData) {
    try {
      const systemMessage = this.prepareSystemMessage();
      const userMessage = this.prepareUserMessage(userData);

      const prompt = `${systemMessage}\n\n${userMessage}`;
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      // Gemini might return text that includes markdown or other formatting
      // We need to extract just the JSON part
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const workoutPlan = JSON.parse(jsonMatch[0]);
      this.validateResponse(workoutPlan);
      return this.addScheduledDates(workoutPlan);
    } catch (error) {
      console.error("Gemini Provider Error:", error);
      throw error;
    }
  }

  async updateWorkoutPlan(currentPlan, feedback, updateType, selectedDay) {
    try {
      const systemMessage = this.prepareSystemMessage(true, updateType, selectedDay);
      const userMessage = this.prepareUserMessage({
        currentPlan,
        feedback,
        updateType,
        selectedDay
      }, true);

      const prompt = `${systemMessage}\n\n${userMessage}`;
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const updatedPlan = JSON.parse(jsonMatch[0]);
      this.validateResponse(updatedPlan);
      
      if (updateType === 'single' && selectedDay) {
        const updatedDay = updatedPlan.workoutPlan.days[0];
        if (!updatedDay || updatedDay.dayNumber !== selectedDay) {
          throw new Error('Updated day does not match selected day number');
        }

        updatedPlan.workoutPlan.days = currentPlan.days.map(day =>
          day.dayNumber === selectedDay ? updatedDay : day
        );
      }

      return updatedPlan;
    } catch (error) {
      console.error("Gemini Provider Error:", error);
      throw error;
    }
  }
}

module.exports = GeminiProvider; 