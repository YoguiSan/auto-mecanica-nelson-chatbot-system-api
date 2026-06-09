import app from '../app.ts';
import useLogger from '../utils/logger.ts';
import Config from '../utils/config.ts';

const Logger = useLogger('Ask Route');

const { AVAILABLE_AIs: AIs} = Config;

app.get('/ask', async (req, res, next) => {
  const chosenAi = AIs[Math.floor(Math.random() * AIs.length)];
  const { question } = req.query;

  if (!question) {
    res.status(400).send('Nenhuma pergunta foi feita');
  } else if (question && (question as string).length < 3) {
    res.status(400).send('Pergunta curta demais');
  } else {
    try {
      req.url = `/${chosenAi}/ask`;

      next('route');
    } catch (error) {
      Logger.error('Erro na chamada', error);
      res.status(500).send('Não consigo responder à sua pergunta agora. Por favor, tente novamente mais tarde');
    }
  }
});
