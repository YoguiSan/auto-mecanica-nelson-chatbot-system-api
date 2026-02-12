import app from '../app.ts';
import GeminiService from '../services/gemini.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Google Gemini Service');
app.get('/gemini/ask', async (req, res) => {
  const {
    question,
  } = req.query;

  if (!question) {
    res.status(400).send('Nenhuma pergunta foi feita');
  }  else if (question && (question as string).length < 3) {
    res.status(400).send('Pergunta curta demais');
  } else {
    try {
      const { status, response } = await GeminiService.ask(question as string);

      res.status(status).send(response);
    } catch (error) {
      Logger.error('Erro na chamada do Gemini', error);

      res.status(500).send('Não consigo responder à sua pergunta agora. Por favor, tente novamente mais tarde');
    }
  }



});
