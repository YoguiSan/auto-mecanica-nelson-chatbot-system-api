import { PickAgent } from '../index.ts';

describe('Agent selection', () => {
  test('picks an agent different from the excluded one', () => {
    const result = PickAgent('gemini');

    expect(result.ChosenAgentName).toBeDefined();
    expect(result.ChosenAgentName).not.toBe('gemini');
  });

  test('returns the selected agent object', () => {
    const result = PickAgent('groq');

    expect(result.ChosenAgent).toBeDefined();
  });
});
