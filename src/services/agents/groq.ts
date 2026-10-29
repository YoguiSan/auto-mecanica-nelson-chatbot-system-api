import OpenAI from 'openai';
import type { IAskOptions, IAgentResponse } from './types.js';
import {
  chatHistory,
  loadChatHistory,
  retryWithAlternativeAgent,
  saveChatExchange,
} from './shared.ts';
import { assembleQuestion } from '../../utils/questions.ts';
import useLogger from '../../utils/logger.ts';
import type { IGroqResponse } from './types/groq.js';
import { chooseAlternativeAgent } from './shared.ts';

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
}: IAskOptions): Promise<IAgentResponse> => {
  let formattedResponse;

  await loadChatHistory(chatId);

  const input = assembleQuestion(question, {
    chatId: chatId!,
    chatHistory,
    type,
  });

  Logger.debug(`Query sent to Groq:
  ${input}
  `);

  const alternative = await chooseAlternativeAgent('groq');
  
  try {
    const Response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input,
    });

    Logger.debug(`Groq raw response: ${JSON.stringify(Response)}`);
  
    const { output } = Response;

    type IGroqResponseOutputItem = NonNullable<IGroqResponse['output']>[number];
    const [filteredResponse] = output.filter((item) => item.type === 'message') as IGroqResponseOutputItem[];

    if (!filteredResponse) {
      throw new Error('Groq response did not contain a message output');
    }

    let responseStatus = 500;
    let text = filteredResponse.content.filter(({ type }: { type: string }) => type === 'output_text')[0]?.text;

    switch (filteredResponse.status) {
      case 'completed':
        responseStatus = 200;
        break;
      case 'in_progress':
        responseStatus = 202;
        text = 'Sua pergunta está sendo processada. Por favor, aguarde um momento.';
        break;
      case 'incomplete':
        responseStatus = 500;
        text = 'Não consegui processar sua pergunta completamente. Por favor, tente novamente.';
        break;
      default:
        responseStatus = 500;
        text = 'Não consigo responder à sua pergunta agora. Por favor, tente novamente mais tarde';
        break;
    }
  
    if (filteredResponse.status === 'completed' && alternative?.ChosenAgent) {
      try {
        const {
          response: validatedResponse,
        } = await alternative.ChosenAgent.ask(text || question, {
          chatId: chatId as string,
          ignoreScope: !!ignoreScope,
          type: 'review',
        }) as { response: unknown };
  
        if (typeof validatedResponse === 'string') {
          text = validatedResponse;
        }
      } catch (err) {
        Logger.error('Error validating response with alternative agent', err);
      }
    }
    
    formattedResponse = {
      response: text || 'Não consegui gerar uma resposta adequada. Por favor, tente novamente.',
      status: responseStatus,
      chatId,
      chatHistory: chatHistory[chatId as string] || [],
    };

    if (type === 'question' && responseStatus === 200) {
      formattedResponse.chatHistory = await saveChatExchange(
        chatId,
        question,
        formattedResponse.response,
      );
    }
  } catch (error) {
    if (alternative?.ChosenAgent) {
      Logger.debug(`Erro ao fazer consulta com o Groq. Tentando com outro agente: ${alternative.ChosenAgentName}`);

      formattedResponse = await retryWithAlternativeAgent({
        alternativeAgent: alternative,
        question,
        chatId: chatId as string,
        ignoreScope: ignoreScope!!,
      });
    }
  }

  return formattedResponse as IAgentResponse;
};

const GroqService = {
  status,
  ask,
};

export default GroqService;