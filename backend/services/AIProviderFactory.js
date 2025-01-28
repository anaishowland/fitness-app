const { config, AI_PROVIDERS } = require('../config/ai.config');
const OpenAIProvider = require('./OpenAIProvider');
const GeminiProvider = require('./GeminiProvider');

class AIProviderFactory {
  static getProvider() {
    switch (config.activeProvider) {
      case AI_PROVIDERS.openai:
        return new OpenAIProvider(config.providers.openai);
      case AI_PROVIDERS.gemini:
        return new GeminiProvider(config.providers.gemini);
      default:
        throw new Error(`Unsupported AI provider: ${config.activeProvider}`);
    }
  }
}

module.exports = AIProviderFactory; 