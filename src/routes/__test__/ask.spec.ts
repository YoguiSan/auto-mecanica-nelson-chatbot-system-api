import app from '../../app.ts';
import '../../routes/ask.ts';

describe('Ask route', () => {
  const startServer = async () => {
    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    return server;
  };

  const getResponse = async (path: string) => {
    const server = await startServer();
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    const text = await response.text();
    server.close();
    return { response, text };
  };

  test('rejects a missing question', async () => {
    const { response, text } = await getResponse('/ask');

    expect(response.status).toBe(400);
    expect(text).toContain('Nenhuma pergunta foi feita');
  });

  test('rejects very short questions', async () => {
    const { response, text } = await getResponse('/ask?question=ok');

    expect(response.status).toBe(400);
    expect(text).toContain('Pergunta curta demais');
  });
});
