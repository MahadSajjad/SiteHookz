import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from "@nestjs/common";
import { SubjectsService } from "./subjects.service";
import { CreateSubjectDto, UpdateSubjectDto } from "@sitehookz/education";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

@Controller("education/subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  create(
    @CurrentTenant() tenant: TenantContext,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(tenant, createSubjectDto);
  }

  @Get()
  findAll(@CurrentTenant() tenant: TenantContext) {
    return this.subjectsService.findAll(tenant);
  }

  @Get(":id")
  findById(@CurrentTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectsService.findById(tenant, id);
  }

  @Patch(":id")
  update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(tenant, id, updateSubjectDto);
  }

  @Post(":id/archive")
  archive(@CurrentTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectsService.archive(tenant, id);
  }
}
