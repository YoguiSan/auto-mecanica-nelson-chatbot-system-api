export type IChatMessage = {
  agent?: 'user' | 'ai';
  text?: string;
  error?: string;
};

export type IChatHistory = {
  [chatId: string]: IChatMessage[];
};

export type IAskOptions = {
  chatId?: string;
  ignoreScope?: boolean;
  type?: 'question' | 'review';
};

type IAIAgent = {
  ask: (question: string, options: IAskOptions) => Promise<unknown>;
  status?: () => Promise<unknown>;
};

export type IAIAgents = {
  [key: string]: IAIAgent;
};

export type IAgentResponse = {
  status: number,
  response: string,
  chatId: string | undefined,
  chatHistory?: unknown,
};