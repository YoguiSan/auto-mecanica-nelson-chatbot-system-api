import OpenAI from 'openai';
import type { IAskOptions } from './types.js';
import { chatHistory, updateChatHistory } from './shared.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import useLogger from '../../utils/logger.ts';

const Logger = useLogger('Groq Service');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

const status = async () => {

};

const ask = async (question: string, {
  chatId,
  ignoreScope,
  type = 'question',
}: IAskOptions) => {
  const input = assembleQuestion(question, {
    chatId: chatId!,
    chatHistory,
    type,
  });

  Logger.debug(`Query sent to Groq:
  ${input}
  `);

  updateChatHistory(chatId as string, question, 'user');

  const Response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    input,
  });

  Logger.debug('Groq response:', Response);

  const {
    response: {
      output,
    },
  } = Response;

  const [response] = output.filter((item) => item.type === 'message');

  return response;
};

const GroqService = {
  status,
  ask,
};

export default GroqService;