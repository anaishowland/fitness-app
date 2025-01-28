require('dotenv').config();

const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini'
};

const config = {
  activeProvider: process.env.AI_PROVIDER || AI_PROVIDERS.OPENAI,
  providers: {
    [AI_PROVIDERS.OPENAI]: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini"
    },
    [AI_PROVIDERS.GEMINI]: {
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash-exp"
    }
  }
};

module.exports = {
  config,
  AI_PROVIDERS
}; 