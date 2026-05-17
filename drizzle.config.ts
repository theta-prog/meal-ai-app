import { defineConfig } from "drizzle-kit";

for (const envPath of [".env.local", ".env"]) {
  if (process.env.DATABASE_URL) break;

  try {
    process.loadEnvFile(envPath);
  } catch {
    // Ignore missing env files and fall back to shell-provided variables.
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
