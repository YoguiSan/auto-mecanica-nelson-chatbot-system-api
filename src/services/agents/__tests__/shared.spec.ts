import { chatHistory, chooseAlternativeAgent, retryWithAlternativeAgent, updateChatHistory } from '../shared.ts';

describe('Agent shared helpers', () => {
  beforeEach(() => {
    Object.keys(chatHistory).forEach((key) => delete chatHistory[key]);
  });

  test('updates chat history for a new chat id', () => {
    updateChatHistory('chat-1', 'Olá', 'user');

    expect(chatHistory['chat-1']).toEqual([
      { agent: 'user', text: 'Olá' },
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
