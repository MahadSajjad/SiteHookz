import { Worker, Job } from "bullmq";
import Redis from "ioredis";

export function setupEmailWorker(connection: Redis) {
  const worker = new Worker(
    "email-queue",
    async (job: Job) => {
      console.log(`Processing email job ${job.id}`);
      const { to, subject, template } = job.data;

      // In development: log email details
      console.log("=== EMAIL DISPATCHED ===");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Template: ${template}`);
      console.log("========================");

      // Never log tokens or secrets here in production!
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
  });

  return worker;
}
