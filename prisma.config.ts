import { defineConfig, env } from "prisma/config";
import { config as dotenvConfig } from "dotenv";

// Load environment variables from .env file
dotenvConfig();

type Env = {
  DATABASE_URL: string;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
});
