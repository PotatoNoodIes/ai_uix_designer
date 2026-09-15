/**
 * PM2 process definitions.
 *
 * pm2 does not read .env on its own, so the API process points at the file
 * explicitly. Without this the server starts with no GEMINI_API_KEY and
 * /generate fails.
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
