import { Controller, Post, Get, Body } from "@nestjs/common";

import {
  CurrentUser,
  UserContext,
} from "../../common/decorators/current-user.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { SkipTenant } from "../tenancy/tenant.guard";

import {
  CreateOrganizationDto,
  createOrganizationSchema,
} from "./dto/create-organization.dto";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @SkipTenant()
  @Post()
  async create(
    @CurrentUser() user: UserContext,
    @Body(new ZodValidationPipe(createOrganizationSchema))
    dto: CreateOrganizationDto,
  ) {
    return this.orgsService.create(user.userAccountId, dto);
  }

  @SkipTenant()
  @Get("my")
  async getMyOrganizations(@CurrentUser() user: UserContext) {
    return this.orgsService.getMyOrganizations(user.userAccountId);
  }
}
