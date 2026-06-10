import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../../utils/config.ts';
import useLogger from '../../utils/logger.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import { chatHistory, retryWithAlternativeAgent, updateChatHistory } from './shared.ts';
import type { IAskOptions } from './types.js';
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

  const alternative = await chooseAlternativeAgent('gemini');

  updateChatHistory(chatId as string, question, 'user');

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
      response: initialResponse.text,
      chatHistory: chatHistory[chatId as string] || [],
    };

    if (type === 'question') {
      if (alternative?.ChosenAgent) {
        Logger.debug(`Validando resposta com o segundo agente de IA: ${alternative.ChosenAgentName}`);

        const response = await alternative.ChosenAgent.ask(fullResponse.response!, {
          chatId: chatId as string,
          ignoreScope: !!ignoreScope,
          type: 'review',
        } as IAskOptions) as string | undefined;

        fullResponse.response = response;
      }
    }

    updateChatHistory(chatId as string, fullResponse.response as string, 'ai');

    return fullResponse;
  } catch (error) {
    Logger.error('Error getting response from Gemini', error);

    updateChatHistory(chatId as string, 'Gemini was unable to answer due to technical issues.', 'ai');

    if ((
      (error as { error: { message: string } })
      .error
      .message
    ).indexOf('You exceeded your current quota') > -1
    ) {
      Logger.warn('Daily quota exceeded');
    }

    try {
      if (alternative?.ChosenAgent) {
        Logger.debug(`Erro ao fazer consulta com o Gemini. Tentando com outro agente: ${alternative.ChosenAgentName}`);
        return retryWithAlternativeAgent({
          alternativeAgent: alternative,
          question,
          chatId: chatId as string,
          ignoreScope: ignoreScope!!,
        });
      }
    } catch (err) {
      return {
        status: 500,
        chatId,
        response: err,
      };
    }
  }
};

const GeminiService = {
  ask,
  status,
};

export default GeminiService;
