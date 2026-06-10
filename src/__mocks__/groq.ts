import nock from 'nock';
import Config from '../utils/config.ts';
import useLogger from '../utils/logger.ts';
import Mock from './json/groq.json' with { type: 'json' };

const Logger = useLogger('Mock | Groq');

const MockGroq = () => {
  Logger.debug('Mocking Groq API responses with nock...');
  nock(Config.GROQ_BASE_URL!)
    .persist()
    .post('/v1/chat/completions')
    .reply(200, Mock)
};

export default MockGroq;
