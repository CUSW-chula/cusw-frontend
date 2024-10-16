module.exports = {
  apps: [
    {
      name: 'cusw',
      exec_mode: 'cluster',
      instances: 'max', // Or a specific number of instances
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env_local: {
        APP_ENV: 'local', // APP_ENV=local
        PORT: 3000 // Run on port 3000 in local
      },
      env_dev: {
        APP_ENV: 'dev', // APP_ENV=dev
        PORT: 4000 // Run on port 4000 in development
      },
      env_prod: {
        APP_ENV: 'prod', // APP_ENV=prod
        PORT: 3000 // Default port in production
      }
    }
  ]
}
