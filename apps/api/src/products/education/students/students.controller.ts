import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { StudentsService } from "./students.service";
import { RequirePermission } from "../../../platform/authorization/permission.guard";
import { PermissionGuard } from "../../../platform/authorization/permission.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  createStudentSchema,
  CreateStudentDto,
  updateStudentSchema,
  UpdateStudentDto,
} from "./dto/create-student.dto";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  admissionBranchId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z
    .enum(["createdAt", "firstName", "admissionNumber"])
    .default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

@Controller("education/students")
@UseGuards(PermissionGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermission("education.students.read")
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query(new ZodValidationPipe(querySchema)) query: any,
  ) {
    return this.studentsService.findAll(tenant, query);
  }

  @Get(":id")
  @RequirePermission("education.students.read")
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.studentsService.findOne(tenant, id);
  }

  @Post()
  @RequirePermission("education.students.create")
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(createStudentSchema)) dto: CreateStudentDto,
  ) {
    return this.studentsService.create(tenant, dto);
  }

  @Patch(":id")
  @RequirePermission("education.students.update")
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateStudentSchema)) dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(tenant, id, dto);
  }

  @Post(":id/archive")
  @RequirePermission("education.students.archive")
  async archive(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.studentsService.archive(tenant, id);
  }

  @Post(":id/restore")
  @RequirePermission("education.students.restore")
  async restore(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.studentsService.restore(tenant, id);
  }
}
