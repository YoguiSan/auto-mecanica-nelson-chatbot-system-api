import OpenAI from 'openai';
import type { IAskOptions } from './types.js';
import { chatHistory, updateChatHistory } from './shared.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import useLogger from '../../utils/logger.ts';
import type { IGroqResponse } from './types/groq.js';

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

  Logger.debug(`Groq raw response: ${JSON.stringify(Response)}`);

  const {
    output,
  } = Response;

  const [filteredResponse]: IGroqResponse = output.filter((item) => item.type === 'message');

  switch (filteredResponse.status) {
    case 'completed':
      // updateChatHistory(chatId as string, response.text, 'agent');
      filteredResponse.status = 200;
      break;
    case 'in_progress':
      filteredResponse.status = 202;
      filteredResponse.text = 'Sua pergunta está sendo processada. Por favor, aguarde um momento.';
      break;
    case 'incomplete':
      filteredResponse.status = 500;
      filteredResponse.text = 'Não consegui processar sua pergunta completamente. Por favor, tente novamente.';
      break;
    default:
      filteredResponse.status = 500;
      filteredResponse.text = 'Não consigo responder à sua pergunta agora. Por favor, tente novamente mais tarde';
      break;
  }
  
  const formattedResponse = {
    response: filteredResponse.content.filter(({ type }: { type: string }) => type === 'output_text')[0]?.text || 'Não consegui gerar uma resposta adequada. Por favor, tente novamente.',
    status: filteredResponse.status,
    chatId,
    chatHistory,
  };

  return formattedResponse;
};

const GroqService = {
  status,
  ask,
};

export default GroqService;