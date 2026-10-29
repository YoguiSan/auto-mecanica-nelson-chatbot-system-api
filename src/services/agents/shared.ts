import type { IAskOptions, IChatHistory, IChatMessage, IAgentResponse } from './types.d.ts';
import { getRedisValue, setRedisValue } from '../../utils/redis.ts';
import useLogger from '../../utils/logger.ts';

export let chatHistory: IChatHistory = {};

const Logger = useLogger('Chat History');
const redisKey = (chatId: string) => `chatbot:chat-history:${chatId}`;

const isChatMessageList = (value: unknown): value is IChatMessage[] => (
  Array.isArray(value)
  && value.every((message) => (
    typeof message === 'object'
    && message !== null
    && 'agent' in message
    && (message.agent === 'user' || message.agent === 'ai')
    && 'text' in message
    && typeof message.text === 'string'
  ))
);

export const loadChatHistory = async (chatId?: string): Promise<IChatMessage[]> => {
  if (!chatId) {
    return [];
  }

  try {
    const cachedHistory = await getRedisValue(redisKey(chatId));

    if (cachedHistory !== null) {
      const parsedHistory: unknown = JSON.parse(cachedHistory);

      if (!isChatMessageList(parsedHistory)) {
        throw new Error('Redis chat history has an invalid format');
      }

      chatHistory[chatId] = parsedHistory;
    }
  } catch (error) {
    Logger.warn('Unable to retrieve chat history from Redis; using in-memory history', error);
  }

  return chatHistory[chatId] ?? [];
};

export const saveChatExchange = async (
  chatId: string | undefined,
  question: string,
  answer: string,
): Promise<IChatMessage[]> => {
  if (!chatId) {
    return [];
  }

  const history = chatHistory[chatId] ?? [];
  history.push(
    { agent: 'user', text: question },
    { agent: 'ai', text: answer },
  );
  chatHistory[chatId] = history;

  try {
    await setRedisValue(redisKey(chatId), JSON.stringify(history));
  } catch (error) {
    Logger.warn('Unable to store chat history in Redis; keeping it in memory', error);
  }

  return history;
};

export const chooseAlternativeAgent = async (agentToExclude: string) => {
  const { AIAgents } = await import('./import.ts');
  const availableAgentKeys = Object.keys(AIAgents).filter((agent) => agent !== agentToExclude);

  if (!availableAgentKeys.length) {
    return null;
  }

  const ChosenAgentName = availableAgentKeys[Math.floor(Math.random() * availableAgentKeys.length)]!;
  const ChosenAgent = AIAgents[ChosenAgentName as keyof typeof AIAgents];

  return {
    ChosenAgent,
    ChosenAgentName,
  };
};

export const retryWithAlternativeAgent = async ({
  alternativeAgent,
  question,
  chatId,
  ignoreScope,
}: {
  alternativeAgent: { ChosenAgent: any; ChosenAgentName: string };
  question: string;
  chatId: string;
  ignoreScope: boolean;
}) => {
  const agentResponse = await alternativeAgent.ChosenAgent.ask(question, {
    chatId: chatId as string,
    ignoreScope: !!ignoreScope,
  } as IAskOptions) as IAgentResponse | string;
  const response = typeof agentResponse === 'string'
    ? agentResponse
    : agentResponse.response;
  const history = await loadChatHistory(chatId);

  const fullResponse = {
    status: typeof agentResponse === 'string' ? 200 : agentResponse.status,
    chatId,
    response,
    chatHistory: history,
  };

  return fullResponse;
};
