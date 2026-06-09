import type { IChatHistory } from './types.d.ts';

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
