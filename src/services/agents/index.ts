import useLogger from '../../utils/logger.ts';
import { AIAgents } from './import.ts';
import { chatHistory, updateChatHistory } from './shared.ts';

const Logger = useLogger('AI Agent Selection');

export const PickAgent = (agentToExclude: string): {
  ChosenAgent: any,
  ChosenAgentName: string,
} => {
  const AvailableAIAgents = { ...AIAgents };

  Logger.debug(`Agent to exclude from selection: ${agentToExclude}`);

  delete AvailableAIAgents[agentToExclude as keyof typeof AvailableAIAgents];

  const availableAgentKeys = Object.keys(AvailableAIAgents);

  Logger.debug(`Available agents after exclusion: ${availableAgentKeys.join(', ')}`);

  const ChosenAgentName: string = availableAgentKeys[Math.floor(Math.random() * availableAgentKeys.length)]!;

  const ChosenAgent = AvailableAIAgents[ChosenAgentName as keyof typeof AvailableAIAgents]!;

  Logger.debug(`Chosen AI Agent: ${ChosenAgentName}`);
  Logger.debug(`Chosen AI Agent details: ${JSON.stringify(ChosenAgent)}`);

  return {
    ChosenAgent,
    ChosenAgentName,
  };
};

export {
  chatHistory,
  updateChatHistory,
};
