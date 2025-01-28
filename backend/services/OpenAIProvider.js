const OpenAI = require('openai');
const BaseAIProvider = require('./BaseAIProvider');

class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey
    });
  }

  async generateWorkoutPlan(userData) {
    try {
      const systemMessage = this.prepareSystemMessage();
      const userMessage = this.prepareUserMessage(userData);

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const workoutPlan = JSON.parse(response.choices[0].message.content);
      this.validateResponse(workoutPlan);
      return this.addScheduledDates(workoutPlan);
    } catch (error) {
      console.error("OpenAI Provider Error:", error);
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

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const updatedPlan = JSON.parse(response.choices[0].message.content);
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
      console.error("OpenAI Provider Error:", error);
      throw error;
    }
  }
}

module.exports = OpenAIProvider; 