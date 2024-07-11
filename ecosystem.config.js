module.exports = {
  apps: [
    {
      name: 'reol',
      script: './dist/index.js',
      watch: false,
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
    },
  ],
};
