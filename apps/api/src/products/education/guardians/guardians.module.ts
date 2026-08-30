import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../../infrastructure/database/database.module";

import { GuardiansController } from "./guardians.controller";
import { GuardiansService } from "./guardians.service";

@Module({
  imports: [DatabaseModule],
  controllers: [GuardiansController],
  providers: [GuardiansService],
})
export class GuardiansModule {}
