import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../utils/config.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Google Gemini Service');

const { GEMINI_API_KEY: apiKey } = Config;

const ai = new GoogleGenAI({
  apiKey,
} as GoogleGenAIOptions);

const status = async () => {
  const content = 'This is a request to check the status of our communication. Please respond including the current date and time in ISO format';

  return ask(content, true);
};

const ask = async (question: string, ignoreScope?: boolean) => {
  const scope = `Scope: you are a mechanic from São Paulo, Brazil.
  The application we're running is for an auto repair shop located in the same city.
  Your job is to answer to simple doubts customers might have, or guide them on possible causes on the issues they report in their cars, and also guide them on the services we offer (listed below).
  if they ask about issues on their vehicle, but fail to provide details such as year, model, engine displacement, manufacturer, please ask them for these details before proceeding.
  Do not give instructions on procedures that require skill or knowledge beyond basic driving experience to perform, as this might risk injuring the driver or damaging their car. Their safety is our top priority. If their issue is something that requires the intervention of a professional mechanic, guide them to reach out to us (they will be using this chat from within our web page).
  You can check on forums or unverified sources, but please alert them that this information is not verified and where it comes from.
  Always remind them that if they lack the required skills or when in doubt, reach out to us or their trusted professional, and if they decide to do the job themselves, they must wear protective gear at all times.
  If they ask something that has no relation to automotive mechanics, please kindly let them know that this is outside your scope.
  Our customers are from Brazil, so always respond in Brazilian Portuguese.
  Avoid excessive technical jargons, unless they demonstrate to be familiar with them.
  Available services: yet to be done, please tell them to reach out to us.
  Their question starts below.

  `;

  const contents = ignoreScope
    ? question
    : `${scope}
    ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    Logger.info(response?.text || 'No response');

    return {
      status: 200,
      response,
    };
  } catch (error) {
    Logger.error('Error getting response from Gemini', error);
    return {
      status: 500,
      response: error,
    };
  }
};

const GeminiService = {
  ask,
  status,
}

export default GeminiService;
