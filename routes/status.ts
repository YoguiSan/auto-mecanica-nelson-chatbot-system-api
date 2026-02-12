import app from '../app.ts';
import useLogger from '../utils/logger.ts';

const Logger = useLogger('Status Route');

app.use('/status',  (req, res) => {
  Logger.debug('Server is still running');
  res.status(200).send('Server is still running');
});

app.use('/ai-status', (req, res) => {
  Logger.debug('Checking for the status of the AI tool...');

  
});
