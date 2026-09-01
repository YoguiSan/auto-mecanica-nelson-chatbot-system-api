module.exports = {
  apps: [{
    name: 'amn-chatbot-system-api',
    script: './dist/index.cjs',
    max_memory_restart: '510M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
