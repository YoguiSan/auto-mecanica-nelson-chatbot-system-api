import dotenv from 'dotenv';

dotenv.config();

type Config = {
  AI_URL: string,
  AI_API_KEY: string,
  PORT: string | number,
  ENVIRONMENT: string,
  DEBUG: boolean,
};

const Config = {
  AI_URL: process.env.AI_TOOL_URL,
  AI_API_KEY: process.env.AI_TOOL_API_KEY,
  PORT: process.env.PORT,
  ENVIRONMENT: process.env.ENVIRONMENT,
  DEBUG: (
    process.env.ENVIRONMENT !== 'prod'
    && process.env.ENVIRONMENT !== 'production'
  ),
};

export default Config;
