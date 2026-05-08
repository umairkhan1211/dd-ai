import dotenv from 'dotenv';

dotenv.config();

interface OpenAIConfig {
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

const openaiConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  defaultModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.5'),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500', 10),
  frequencyPenalty: parseFloat(process.env.OPENAI_FREQUENCY_PENALTY || '0'),
  presencePenalty: parseFloat(process.env.OPENAI_PRESENCE_PENALTY || '0'),
};

// Throw an error if API key is missing
if (!openaiConfig.apiKey) {
  console.warn('OpenAI API key is missing. Set OPENAI_API_KEY in your environment.');
}

export default openaiConfig; 