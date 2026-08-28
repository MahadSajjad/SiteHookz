import { Global, Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { PermissionsController } from "./permissions.controller";

@Global()
@Module({
  controllers: [PermissionsController],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
