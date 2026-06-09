import app from '../../app.ts';
import GroqService from '../../services/agents/groq.ts';
import { simpleSessionId } from '../../utils/crypto.ts';
import useLogger from '../../utils/logger.ts';

const Logger = useLogger('Groq Service');

type IQuery = {
  question: string;
  type?: 'question' | 'review';
};

app.get('/grok/ask', async (req, res) => {
  const {
    question,
    type,
  } = req.query as IQuery;

  if (!question) {
    res.status(400).send('Nenhuma pergunta foi feita');
  }  else if (question && (question as string).length < 3) {
    res.status(400).send('Pergunta curta demais');
  } else {
    try {
      let sessionId = req.get('chatId');

      if (!sessionId) {
        sessionId = simpleSessionId();
      }

      Logger.debug(`Received chat id: ${sessionId}`);

      const { status, response, chatId, chatHistory } = await GroqService.ask(question as string, {
        chatId: sessionId as string,
        ignoreScope: false,
        type: type as 'question' | 'review',
      });


      res.status(status).send({
        response,
        chatId,
        chatHistory,
      });
    } catch (error) {
      Logger.error('Erro na chamada do Groq', error);

      res.status(500).send('Não consigo responder à sua pergunta agora. Por favor, tente novamente mais tarde');
    }
  }
});
