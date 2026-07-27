import Config from '../utils/config.ts';
import MockGemini from './gemini.ts';
import MockGroq from './groq.ts';

const {
  MOCK_AI_RESPONSES,
} = Config;

if (MOCK_AI_RESPONSES) {
  MockGroq();
  // MockGemini();
}
