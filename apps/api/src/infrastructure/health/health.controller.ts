import { Controller, Get } from "@nestjs/common";

import { Public } from "../../common/decorators/public.decorator";
import { PrismaService } from "../database/prisma.service";
import { RedisService } from "../redis/redis.service";

@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get("health")
  checkHealth() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Public()
  @Get("ready")
  async checkReady() {
    let dbStatus = "ok";
    let redisStatus = "ok";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    try {
      await this.redis.getClient().ping();
    } catch {
      redisStatus = "error";
    }

    const isOk = dbStatus === "ok" && redisStatus === "ok";

    return {
      status: isOk ? "ok" : "degraded",
      checks: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }
}
