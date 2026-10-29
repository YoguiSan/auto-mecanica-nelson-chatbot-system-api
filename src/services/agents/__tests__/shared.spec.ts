import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const redisMocks = {
  getRedisValue: jest.fn().mockResolvedValue(null as string | null),
  setRedisValue: jest.fn().mockResolvedValue(undefined),
};

jest.unstable_mockModule('../../../utils/redis.ts', () => redisMocks);

const { getRedisValue, setRedisValue } = redisMocks;
const {
  chatHistory,
  chooseAlternativeAgent,
  loadChatHistory,
  retryWithAlternativeAgent,
  saveChatExchange,
} = await import('../shared.ts');

describe('Agent shared helpers', () => {
  beforeEach(() => {
    Object.keys(chatHistory).forEach((key) => delete chatHistory[key]);
    jest.clearAllMocks();
    jest.mocked(getRedisValue).mockResolvedValue(null);
    jest.mocked(setRedisValue).mockResolvedValue(undefined);
  });

  test('updates chat history for a new chat id', async () => {
    await saveChatExchange('chat-1', 'Olá', 'Oi');

    expect(chatHistory['chat-1']).toEqual([
      { agent: 'user', text: 'Olá' },
      { agent: 'ai', text: 'Oi' },
    ]);
  });

  test('hydrates chat history from Redis', async () => {
    jest.mocked(getRedisValue).mockResolvedValue(JSON.stringify([
      { agent: 'user', text: 'Olá' },
      { agent: 'ai', text: 'Oi' },
    ]));

    await expect(loadChatHistory('chat-redis')).resolves.toEqual([
      { agent: 'user', text: 'Olá' },
      { agent: 'ai', text: 'Oi' },
    ]);
    expect(chatHistory['chat-redis']).toEqual([
      { agent: 'user', text: 'Olá' },
      { agent: 'ai', text: 'Oi' },
    ]);
  });

  test('writes the completed exchange to Redis once', async () => {
    await saveChatExchange('chat-save', 'Pergunta', 'Resposta');

    expect(setRedisValue).toHaveBeenCalledTimes(1);
    expect(setRedisValue).toHaveBeenCalledWith(
      'chatbot:chat-history:chat-save',
      JSON.stringify([
        { agent: 'user', text: 'Pergunta' },
        { agent: 'ai', text: 'Resposta' },
      ]),
    );
  });

  test('keeps chat history in memory when Redis is unavailable', async () => {
    jest.mocked(getRedisValue).mockRejectedValue(new Error('Redis unavailable'));

    await expect(loadChatHistory('chat-offline')).resolves.toEqual([]);
    await expect(saveChatExchange('chat-offline', 'Pergunta', 'Resposta')).resolves.toEqual([
      { agent: 'user', text: 'Pergunta' },
      { agent: 'ai', text: 'Resposta' },
    ]);
  });

  test('returns available alternatives when one agent is excluded', async () => {
    const result = await chooseAlternativeAgent('gemini');

    expect(result).toBeTruthy();
    expect(result?.ChosenAgentName).toBe('groq');
  });

  test('builds a success response payload for a retry', async () => {
    const alternativeAgent = {
      ChosenAgent: {
        ask: jest.fn().mockResolvedValue('Resposta alternativa'),
      },
      ChosenAgentName: 'groq',
    };

    const result = await retryWithAlternativeAgent({
      alternativeAgent,
      question: 'Pergunta',
      chatId: 'chat-2',
      ignoreScope: false,
    });

    expect(result.status).toBe(200);
    expect(result.chatId).toBe('chat-2');
    expect(result.response).toBe('Resposta alternativa');
  });
});
