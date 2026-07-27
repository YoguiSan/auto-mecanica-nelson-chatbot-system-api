import nock from 'nock';
import Config from '../utils/config.ts';
import useLogger from '../utils/logger.ts';
import Mock from './json/gemini.json' with { type: 'json' };

const Logger = useLogger('Mock | Gemini');

const MockGemini = () => {
  Logger.debug('Mocking Gemini API responses with nock...');
  nock(Config.GEMINI_BASE_URL!)
    .persist()
    .post('/v1/chat/completions')
    .reply(200, Mock)
};

export default MockGemini;
