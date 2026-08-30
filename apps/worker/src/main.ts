import Redis from "ioredis";

import { env } from "./config";
import { setupEmailWorker } from "./workers/email.worker";

async function bootstrap() {
  console.log("Starting SiteHookz Worker...");

  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  connection.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  const emailWorker = setupEmailWorker(connection);

  const shutdown = async () => {
    console.log("Shutting down gracefully...");
    await emailWorker.close();
    connection.quit();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  console.log("Worker is running and waiting for jobs.");
}

bootstrap().catch((err) => {
  console.error("Failed to start worker:", err);
  process.exit(1);
});
