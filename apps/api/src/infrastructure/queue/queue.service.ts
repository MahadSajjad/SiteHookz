import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(@InjectQueue("default") private readonly defaultQueue: Queue) {}

  async addJob(name: string, data: any, opts?: any) {
    this.logger.log(`Adding job ${name} to queue`);
    return this.defaultQueue.add(name, data, opts);
  }
}
