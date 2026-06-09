import { type IAIAgents, type IChatHistory } from './types.d.ts';
import useLogger from '../../utils/logger.ts';

const Logger = useLogger('AI Agent Selection');

export const AIAgents:IAIAgents = {
  gemini: () => import('./gemini.ts'),
  groq: () => import('./groq.ts'),
};

export const PickAgent = (agentToExclude: string) => {
  const AvailableAIAgents = AIAgents;

  Logger.debug(`Agent to exclude from selection: ${agentToExclude}`);

  delete AvailableAIAgents[agentToExclude as keyof typeof AvailableAIAgents];

  const availableAgentKeys = Object.keys(AvailableAIAgents);

  Logger.debug(`Available agents after exclusion: ${availableAgentKeys.join(', ')}`);

  const ChosenAgentName: string = availableAgentKeys[Math.floor(Math.random() * availableAgentKeys.length)]!;

  const ChosenAgent = AvailableAIAgents[ChosenAgentName as keyof typeof AvailableAIAgents]!;

  Logger.debug(`Chosen AI Agent: ${ChosenAgentName}`);

  return {
    ChosenAgent,
    ChosenAgentName,
  };
};

export let chatHistory: IChatHistory = {};
