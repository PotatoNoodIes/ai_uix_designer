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
