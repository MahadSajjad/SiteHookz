import { Controller, Get, Post, Body, Patch, Param, UseGuards } from "@nestjs/common";
import { SubjectsService } from "./subjects.service";
import { CreateSubjectDto, UpdateSubjectDto } from "@sitehookz/education";
import { RequireAuth } from "../../../core/auth/decorators/require-auth.decorator";
import { GetTenant } from "../../../core/auth/decorators/get-tenant.decorator";
import { TenantContext } from "../../../core/auth/tenant-context";

@Controller("education/subjects")
@RequireAuth()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(@GetTenant() tenant: TenantContext, @Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(tenant, createSubjectDto);
  }

  @Get()
  findAll(@GetTenant() tenant: TenantContext) {
    return this.subjectsService.findAll(tenant);
  }

  @Get(":id")
  findById(@GetTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectsService.findById(tenant, id);
  }

  @Patch(":id")
  update(
    @GetTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() updateSubjectDto: UpdateSubjectDto
  ) {
    return this.subjectsService.update(tenant, id, updateSubjectDto);
  }

  @Post(":id/archive")
  archive(@GetTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectsService.archive(tenant, id);
  }
}
