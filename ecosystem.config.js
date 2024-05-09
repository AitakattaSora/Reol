module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: 'dist/index.js',
      watch: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
