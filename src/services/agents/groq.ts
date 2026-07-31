import OpenAI from 'openai';
import type { IAskOptions, IAgentResponse } from './types.js';
import { chatHistory, retryWithAlternativeAgent, updateChatHistory } from './shared.ts';
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

  const input = assembleQuestion(question, {
    chatId: chatId!,
    chatHistory,
    type,
  });

  Logger.debug(`Query sent to Groq:
  ${input}
  `);

  const alternative = await chooseAlternativeAgent('groq');
  
  updateChatHistory(chatId as string, question, 'user');
  
  try {
    const Response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input,
    });

    Logger.debug(`Groq raw response: ${JSON.stringify(Response)}`);
  
    const {
      output,
    } = Response;
  
    const [filteredResponse]: IGroqResponse = output.filter((item) => item.type === 'message') as IGroqResponse;
  
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
  
    let text = filteredResponse.content.filter(({ type }: { type: string }) => type === 'output_text')[0]?.text;
  
    if (filteredResponse.status === 200) {
      try {
        const {
          response: validatedResponse,
        } = await alternative?.ChosenAgent?.ask(question, {
          chatId: chatId as string,
          type: 'question',
        }) as { response: unknown };
  
        text = validatedResponse;
      } catch (err) {
        Logger.error('Error validating response with alternative agent', err);
      }
    }
    
    formattedResponse = {
      response: text || 'Não consegui gerar uma resposta adequada. Por favor, tente novamente.',
      status: filteredResponse.status,
      chatId,
      chatHistory,
    };
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