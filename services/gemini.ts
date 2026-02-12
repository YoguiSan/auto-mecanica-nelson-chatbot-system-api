import { GoogleGenAI, type GoogleGenAIOptions } from '@google/genai';
import Config from '../utils/config.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Google Gemini Service');

const { GEMINI_API_KEY: apiKey } = Config;

const ai = new GoogleGenAI({
  apiKey,
} as GoogleGenAIOptions);

const ask = async (contents: string) => {
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
}

export default GeminiService;
