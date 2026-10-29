import { createClient } from 'redis';
import Config from './config.ts';
import useLogger from './logger.ts';

const Logger = useLogger('Redis');
const client = Config.REDIS_URL
  ? createClient({
    url: Config.REDIS_URL,
    socket: {
      reconnectStrategy: false,
    },
  })
  : undefined;

let connectionPromise: Promise<void> | undefined;

client?.on('error', (error) => {
  Logger.error('Redis client error', error);
});

const connect = async () => {
  if (!client) {
    return false;
  }

  if (client.isReady) {
    return true;
  }

  if (!connectionPromise) {
    connectionPromise = client.connect()
      .then(() => undefined)
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  await connectionPromise;
  return client.isReady;
};

export const getRedisValue = async (key: string) => {
  if (!await connect() || !client) {
    return null;
  }

  return client.get(key);
};

export const setRedisValue = async (key: string, value: string) => {
  if (!await connect() || !client) {
    return;
  }

  await client.set(key, value);
};
