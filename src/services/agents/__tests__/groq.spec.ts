import GroqService from '../groq.ts';

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    responses: {
      create: jest.fn().mockResolvedValue({
        output: [
          {
            type: 'message',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Resposta groq' }],
          },
        ],
      }),
    },
  })),
}));

describe('Groq agent service', () => {
  test('returns a successful response payload', async () => {
    const result = await GroqService.ask('Olá', {
      chatId: 'chat-groq',
      ignoreScope: true,
    });

    expect(result.status).toBe(200);
    expect(result.response).toBe('Resposta groq');
    expect(result.chatId).toBe('chat-groq');
  });
});
