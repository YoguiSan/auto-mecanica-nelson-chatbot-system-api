import app from '../app.ts';
import GeminiService from '../services/gemini.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Status Route');

app.get('/status',  (req, res) => {
  Logger.debug('Server is still running');
  res.status(200).send('Server is still running');
});

app.get('/ai-status', async (req, res) => {
  Logger.debug('Checking for the status of the AI tool...');

  const { status, response } = await GeminiService.ask('This is a request to check the status of our communication. Please respond including the date and time in ISO format');

  res.status(status).send(response);
});
