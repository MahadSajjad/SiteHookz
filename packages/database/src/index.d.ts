export * from "@prisma/client";
import { PrismaClient } from "@prisma/client";
export declare function createPrismaClient(): PrismaClient<
  {
    log: ("info" | "query" | "warn" | "error")[];
  },
  "info" | "query" | "warn" | "error",
  import("@prisma/client/runtime/library").DefaultArgs
>;
//# sourceMappingURL=index.d.ts.map
