import dotenv from 'dotenv';

dotenv.config();

type Config = {
  AI_URL: string,
  GEMINI_API_KEY: string,
  PORT: string | number,
  ENVIRONMENT: string,
  DEBUG: boolean,
  ADMIN_PHRASE: string,
  QUESTIONS: {
    AI_QUESTION_SCOPE: string,
    AI_REVIEW_SCOPE: string,
  },
};

const Config = {
  AI_URL: process.env.AI_TOOL_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  PORT: process.env.PORT,
  ENVIRONMENT: process.env.ENVIRONMENT,
  DEBUG: (
    process.env.ENVIRONMENT !== 'prod'
    && process.env.ENVIRONMENT !== 'production'
  ),
  ADMIN_PHRASE: process.env.ADMIN_PHRASE,
  QUESTIONS: {
    AI_QUESTION_SCOPE: process.env.AI_QUESTION_SCOPE,
    AI_REVIEW_SCOPE: process.env.AI_REVIEW_SCOPE,
  },
  AVAILABLE_AIs: [
    'gemini',
  ],
};

export default Config;
