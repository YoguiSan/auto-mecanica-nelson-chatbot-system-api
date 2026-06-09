import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../../utils/config.ts';
import useLogger from '../../utils/logger.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import {
  chatHistory,
  PickAgent,
} from './index.ts';
import type { IAskOptions } from './types.js';

const Logger = useLogger('Google Gemini Service');

const { GEMINI_API_KEY: apiKey } = Config;

const ai = new GoogleGenAI({
  apiKey,
} as GoogleGenAIOptions);

// FIXME: mocked
// const { ChosenAgent } = PickAgent('gemini');
const ChosenAgent = 'gemini';

const status = async () => {
  const content = 'This is a request to check the status of our communication. Please respond including the current date and time in ISO format';

  return ask(content, {
    ignoreScope: true,
  });
};

const ask = async (question: string, {
  chatId,
  ignoreScope,
  type = 'question',
}: IAskOptions) => {
  const scope = assembleQuestion(question, {
    chatId: chatId!,
    chatHistory,
    type,
  });
  
  const contents = ignoreScope
    ? question
    : `${scope}
    ${question}`;
  
  Logger.debug(`Query sent to Gemini:
  
  ${contents}
  `);

  if (chatId && !chatHistory[chatId as string]) {
    chatHistory[chatId as string] = [];   
  }

  if (chatId) {
    chatHistory[chatId as string]!.push({
      agent: 'user',
      text: question as string,
    });
  }

  try {
    Logger.debug(`
    Request information: 
    
    chatId: ${chatId}
    query: ${question}
    chatHistory (in memory): ${JSON.stringify(chatHistory)}
    `);

    const initialResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    Logger.info(initialResponse?.text || 'No response');

     const fullResponse = {
      status: 200,
      chatId,
      response: initialResponse,
      chatHistory: chatHistory[chatId as string] || [],
    };

    try {
      const response = await ChosenAgent.ask(question, {
        chatId,
        ignoreScope,
        type: 'review',
      } as IAskOptions);

        chatHistory[chatId as string]!.push({
        agent: 'ai',
        text: response?.text as string,
      });

      fullResponse.response = response;
    } catch (error) {
      Logger.error('Erro ao validar resposta com o segundo agente de IA', error);
    } finally {
      Logger.debug(JSON.stringify(fullResponse));
  
      return fullResponse;
    }

  } catch (error) {
    Logger.error('Error getting response from Gemini', error);

    chatHistory[chatId as string]!.push({
      agent: 'ai',
      text: 'Unable to answer due to technical issues.',
      error: error as string,
    });

    if ((error as string).indexOf('You exceeded your current quota') > -1) {
      Logger.warn('Daily quota exceeded');
    }

    return {
      status: 500,
      chatId,
      response: error,
    };
  }
};

const GeminiService = {
  ask,
  status,
}

export default GeminiService;
