module.exports = {
  apps: [{
    name: 'amn-chatbot-system-api',
    script: './src/index.ts',
    interpreter: 'ts-node',
    interpreter_args: '--transpile-only',  // Skip type checking
    max_memory_restart: '510M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
