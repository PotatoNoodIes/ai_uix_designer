/**
 * PM2 process definitions.
 *
 * pm2 does not read .env on its own. The deploy script sources .env into the
 * shell before `pm2 start`, and env_file is declared here as a second line of
 * defence on pm2 >= 5.2. Without either, the server starts with no
 * GEMINI_API_KEY and /generate fails.
 */
module.exports = {
  apps: [
    {
      name: "uix-api",
      script: "node_modules/.bin/tsx",
      args: "api/server.ts",
      cwd: "/home/jose/uix-agent",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
