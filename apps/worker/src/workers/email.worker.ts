import { JobTypes } from "@sitehookz/jobs";
import { Worker } from "bullmq";

import { config } from "../config";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type, data } = job.data;
    
    switch (type) {
      case JobTypes.SEND_WELCOME_EMAIL:
        console.log(`Sending welcome email to ${data.email}`);
        break;
      case JobTypes.SEND_INVITATION_EMAIL:
        console.log(`Sending invitation email to ${data.email}`);
        break;
      default:
        console.log(`Unknown email job type: ${type}`);
    }
  },
  {
    connection: config.redis,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed with error ${err.message}`);
});
