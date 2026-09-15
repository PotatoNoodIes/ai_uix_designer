module.exports = {
  apps: [
    {
      name: "uix-api",
      script: "node_modules/.bin/tsx",
      args: "api/server.ts",
      interpreter: process.env.NODE_BIN || process.execPath,
      cwd: "/home/jose/uix-agent",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
