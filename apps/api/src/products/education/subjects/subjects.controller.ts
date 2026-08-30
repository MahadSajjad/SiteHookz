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
import { CreateSubjectDto, UpdateSubjectDto, createSubjectSchema, updateSubjectSchema } from "@sitehookz/education";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
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
    @Body(new ZodValidationPipe(createSubjectSchema)) createSubjectDto: CreateSubjectDto,
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
    @Body(new ZodValidationPipe(updateSubjectSchema)) updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(tenant, id, updateSubjectDto);
  }

  @Post(":id/archive")
  archive(@CurrentTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectsService.archive(tenant, id);
  }
}
