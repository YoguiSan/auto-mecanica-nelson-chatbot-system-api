import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../../utils/config.ts';
import useLogger from '../../utils/logger.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import { chatHistory, loadChatHistory, retryWithAlternativeAgent, saveChatExchange } from './shared.ts';
import type { IAskOptions, IAgentResponse } from './types.js';
import { chooseAlternativeAgent } from './shared.ts';

const Logger = useLogger('Google Gemini Service');

const { GEMINI_API_KEY: apiKey } = Config;

const ai = new GoogleGenAI({
  apiKey,
} as GoogleGenAIOptions);

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
}: IAskOptions): Promise<IAgentResponse> => {
  let formattedResponse;

  await loadChatHistory(chatId);

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

  const alternative = await chooseAlternativeAgent('gemini');

  try {
    Logger.debug(`
      Request information:
      
      chatId: ${chatId}
      query: ${question}
    `);
    // chatHistory (in memory): ${JSON.stringify(chatHistory)}

    const initialResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    Logger.info(initialResponse?.text || 'No response');

    const fullResponse = {
      status: 200,
      chatId,
      response: initialResponse.text as string,
      chatHistory: chatHistory[chatId as string] || [],
    };

    if (type === 'question') {
      if (alternative?.ChosenAgent) {
        Logger.debug(`Validando resposta com o segundo agente de IA: ${alternative.ChosenAgentName}`);

        const reviewResult = await alternative.ChosenAgent.ask(fullResponse.response!, {
          chatId: chatId as string,
          ignoreScope: !!ignoreScope,
          type: 'review',
        } as IAskOptions);

        if (typeof reviewResult === 'string') {
          fullResponse.response = reviewResult;
        } else if (
          typeof reviewResult === 'object'
          && reviewResult !== null
          && 'response' in reviewResult
          && typeof reviewResult.response === 'string'
        ) {
          fullResponse.response = reviewResult.response;
        }
      }

      fullResponse.chatHistory = await saveChatExchange(
        chatId,
        question,
        fullResponse.response as string,
      );
    }

    formattedResponse = fullResponse;
  } catch (error) {
    Logger.error('Error getting response from Gemini', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('You exceeded your current quota')) {
      Logger.warn('Daily quota exceeded');
    }

    try {
      if (alternative?.ChosenAgent) {
        Logger.debug(`Erro ao fazer consulta com o Gemini. Tentando com outro agente: ${alternative.ChosenAgentName}`);

        formattedResponse = await retryWithAlternativeAgent({
          alternativeAgent: alternative,
          question,
          chatId: chatId as string,
          ignoreScope: ignoreScope!!,
        });
      }
    } catch (err) {
      formattedResponse = {
        status: 500,
        chatId: chatId as string,
        response: err as string,
      };
    }
  }

  return formattedResponse as IAgentResponse;
};

const GeminiService = {
  ask,
  status,
};

export default GeminiService;
