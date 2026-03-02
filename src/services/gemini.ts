import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../utils/config.ts';
import useLogger from '../utils/logger.ts';

export type ChatMessage = {
  agent?: 'user' | 'ai';
  text?: string;
  error?: string;
};

export type ChatHistoryType = {
  [chatId: string]: ChatMessage[];
};

let chatHistory: ChatHistoryType = {};

const Logger = useLogger('Google Gemini Service');

const { GEMINI_API_KEY: apiKey, ADMIN_PHRASE } = Config;

const ai = new GoogleGenAI({
  apiKey,
} as GoogleGenAIOptions);

const status = async () => {
  const content = 'This is a request to check the status of our communication. Please respond including the current date and time in ISO format';

  return ask(content, undefined, true);
};

const ask = async (question: string, chatId?: string, ignoreScope?: boolean) => {
  const scope = `Scope: you are a mechanic from São Paulo, Brazil.
  The application we're running is for an auto repair shop located in the same city.
  Your job is to answer to simple doubts customers might have, or guide them on possible causes on the issues they report in their cars, and also guide them on the services we offer (listed below).
  if they ask about issues on their vehicle, but fail to provide details such as year, model, engine displacement, manufacturer, please ask them for these details before proceeding.
  Do not give instructions on procedures that require skill or knowledge beyond basic driving experience to perform, as this might risk injuring the driver or damaging their car. Their safety is our top priority. If their issue is something that requires the intervention of a professional mechanic, guide them to reach out to us (they will be using this chat from within our web page).
  You can check on forums or unverified sources, but please alert them that this information is not verified and where it comes from.
  Always remind them that if they lack the required skills or when in doubt, reach out to us or their trusted professional, and if they decide to do the job themselves, they must wear protective gear at all times.
  If they ask something that has no relation to automotive mechanics, please kindly let them know that this is outside your scope. There is an exception to this: if the query includes the following specific text:
  
  ${ADMIN_PHRASE}
  That means it must be one of the developers or employees testing something in production. In this case, you can assist them, but don't provide any credentials or any sensitive information you might have access to; if needed, they'll include inline code to directly print these.

  Our customers are from Brazil, so always respond in Brazilian Portuguese.
  Avoid excessive technical jargons, unless they demonstrate to be familiar with them.
  Available services: yet to be done, please tell them to reach out to us.
  
  ${
    chatId && chatHistory[chatId as string] && chatHistory[chatId as string]!.length > 0
      ? `
      This is the chat history so far:
      ${chatHistory[chatId as string]!.map(({
        agent,
        text,
      }: ChatMessage) => `${
        agent === 'user'
        ? 'User asked'
        : 'You replied'
      }: ${text}

      `)}

      `
      : 'This chat still has no history, or there was an issue retrieving it.'
  }

  Their question starts below.

  `;
  
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

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    Logger.info(response?.text || 'No response');

    chatHistory[chatId as string]!.push({
      agent: 'ai',
      text: response.text as string,
    });

    const fullResponse = {
      status: 200,
      chatId,
      response,
      chatHistory: chatHistory[chatId as string] || [],
    };

    Logger.debug(JSON.stringify(fullResponse));

    return fullResponse;
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
