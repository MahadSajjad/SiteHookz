import { Module } from "@nestjs/common";
import { GuardiansController } from "./guardians.controller";
import { GuardiansService } from "./guardians.service";
import { DatabaseModule } from "../../../infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [GuardiansController],
  providers: [GuardiansService],
})
export class GuardiansModule {}
