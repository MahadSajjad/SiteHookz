import { Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { QueueService } from "./queue.service";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get("REDIS_URL"),
        },
      }),
    }),
    BullModule.registerQueue({
      name: "default",
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
