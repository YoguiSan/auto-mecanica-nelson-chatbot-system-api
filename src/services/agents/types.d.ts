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

export type IAIAgents = {
  gemini: () => Promise<typeof import('./gemini.ts')>;
  groq: () => Promise<typeof import('./groq.ts')>;
};
