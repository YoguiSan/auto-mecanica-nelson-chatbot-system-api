import winston from 'winston';
import Config from './config.ts';

const assembleMessage = (moduleName: string, message: string) => `[${moduleName}] ${message}`

const log = (
  moduleName: string,
  type: 'error' | 'log' | 'warn' | 'debug',
  message: string,
  error?: { message: string } | unknown,
) => {
  const fullMessage = assembleMessage(
    moduleName,
    `${message}
    ${error
      ? (error as { message?: string })?.message || error
      : ''
    }`,
  );

  if (type === 'debug') {
    type = 'log';

    const { DEBUG } = Config;

    if (DEBUG) {
      console[type](fullMessage);  
    }
  } else {
    console[type](fullMessage);
  }
};

const useLogger = (moduleName: string) => {
  return {
    error: (message: string, error: unknown) => log(moduleName, 'error', message, error),
    log: (message: string) => log(moduleName, 'log', message),
    info: (message: string) => log(moduleName, 'log', message),
    debug: (message: string) => log(moduleName, 'debug', message),
    warn: (message: string) => log(moduleName, 'warn', message),
  }
};

export default useLogger;
