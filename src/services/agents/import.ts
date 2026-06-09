import GeminiService from './gemini.ts';
import GroqService from './groq.ts';
import type { IAIAgents } from './types.js';

export const AIAgents: IAIAgents = {
  gemini: GeminiService,
  groq: GroqService,
};
