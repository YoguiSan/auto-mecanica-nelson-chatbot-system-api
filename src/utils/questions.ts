import type { IChatHistory, IChatMessage } from  '../services/gemini.ts';
import Config from './config.ts';

const {
  ADMIN_PHRASE,
  QUESTIONS,
} = Config;

type IAssembleOptions = {
  chatId?: string;
  chatHistory: IChatHistory;
  type?: 'question' | 'review';
};

const {
  AI_QUESTION_SCOPE = '',
  AI_REVIEW_SCOPE = '',
} = QUESTIONS;

export const assembleQuestion = (
  question: string,
  {
    chatId,
    chatHistory,
    type = 'question',
  }: IAssembleOptions,
): string => `${type === 'question' ? AI_QUESTION_SCOPE : AI_REVIEW_SCOPE}

  ${ADMIN_PHRASE}
  That means it must be one of the developers or employees testing something in production. In this case, you can assist them, but don't provide any credentials or any sensitive information you might have access to; if needed, they'll include inline code to directly print these.

  Our customers are from Brazil, so always respond in Brazilian Portuguese.
  Avoid excessive technical jargons, unless they demonstrate to be familiar with them.
  Available services: yet to be done, please tell them to reach out to us.
  
  ${
    chatId && chatHistory[chatId as string] && chatHistory[chatId as string]!.length > 0
      ? `
      This is the chat history so far:
      ${chatHistory[chatId as string]!.map(({
        agent,
        text,
      }: IChatMessage) => `${
        agent === 'user'
        ? 'User asked'
        : 'You replied'
      }: ${text}

      `)}

      `
      : 'This chat still has no history, or there was an issue retrieving it.'
  }

  Their question starts below.

  ${question}
  `;

export const assembleReview = (question: string, {
  chatId,
  chatHistory,
}: IAssembleOptions): string => assembleQuestion(question, {
  chatId,
  chatHistory,
  type: 'review',
} as IAssembleOptions);
