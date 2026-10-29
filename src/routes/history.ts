import app from '../app.ts';
import { loadChatHistory } from '../services/agents/shared.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Chat History Route');

app.get('/history', async (req, res) => {
  const chatId = req.get('chatId');

  if (!chatId) {
    res.status(400).send('Chat ID não informado');
    return;
  }

  try {
    const chatHistory = await loadChatHistory(chatId);
    res.status(200).send({ chatId, chatHistory });
  } catch (error) {
    Logger.error('Erro ao recuperar o histórico do chat', error);
    res.status(500).send('Não foi possível recuperar o histórico do chat');
  }
});
