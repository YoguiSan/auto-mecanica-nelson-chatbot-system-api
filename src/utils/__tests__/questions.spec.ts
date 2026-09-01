import { assembleQuestion, assembleReview } from '../questions.ts';

describe('Question assembly helpers', () => {
  const chatHistory = {
    chat-1: [
      { agent: 'user' as const, text: 'Meu carro faz barulho' },
      { agent: 'ai' as const, text: 'Posso ajudar com isso' },
    ],
  };

  test('assembles a question prompt with history and scope context', () => {
    const prompt = assembleQuestion('Quanto custa um alinhamento?', {
      chatId: 'chat-1',
      chatHistory,
      type: 'question',
    });

    expect(prompt).toContain('Their question starts below');
    expect(prompt).toContain('Quanto custa um alinhamento?');
    expect(prompt).toContain('User asked');
    expect(prompt).toContain('Meu carro faz barulho');
  });

  test('assembles a review prompt when the type is review', () => {
    const prompt = assembleReview('Esta resposta parece boa?', {
      chatId: 'chat-1',
      chatHistory,
    });

    expect(prompt).toContain('Esta resposta parece boa?');
    expect(prompt).toContain('You replied');
    expect(prompt).toContain('Posso ajudar com isso');
  });
});
