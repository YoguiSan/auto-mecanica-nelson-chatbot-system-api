import type { IAskOptions, IChatHistory } from './types.d.ts';

export let chatHistory: IChatHistory = {};

export const updateChatHistory = (
  chatId: string,
  text: string,
  agent: 'user' | 'ai',
) => {
  if (chatId && !chatHistory[chatId]) {
    chatHistory[chatId] = [];
  }

  if (chatId) {
    chatHistory[chatId]!.push({
      agent,
      text,
    });
  }
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
  const response = await alternativeAgent.ChosenAgent.ask(question, {
    chatId: chatId as string,
    ignoreScope: !!ignoreScope,
  } as IAskOptions) as string;

  const fullResponse = {
    status: 200,
    chatId,
    response,
    chatHistory: chatHistory[chatId as string] || [],
  };

  return fullResponse;
};
