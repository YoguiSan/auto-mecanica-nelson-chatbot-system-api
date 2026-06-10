import app from './app.ts';
import Config from './utils/config.ts';
import useLogger from './utils/logger.ts';
import './__mocks__/index.ts';
import './routes/index.ts';

const {
  PORT,
} = Config;

const Logger = useLogger('Server');

app.listen(PORT, () => {
 Logger.info(`Application started and running at port ${PORT}`);
});
