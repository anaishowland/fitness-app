const OpenAI = require('openai');

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This will be set from your environment variables
});

module.exports = openai; 