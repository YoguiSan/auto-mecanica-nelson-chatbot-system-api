import GeminiService from '../gemini.ts';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({ text: 'Resposta gemini' }),
    },
  })),
}));

describe('Gemini agent service', () => {
  test('returns a successful response payload', async () => {
    const result = await GeminiService.ask('Olá', {
      chatId: 'chat-gemini',
      ignoreScope: true,
    });

    expect(result.status).toBe(200);
    expect(result.response).toBe('Resposta gemini');
    expect(result.chatId).toBe('chat-gemini');
  });
});
