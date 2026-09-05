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
import { GradingScalesService } from "./grading-scales.service";
import { RequirePermission } from "../../../../common/decorators/require-permission.decorator";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../../../platform/authorization/permission.guard";
import { TenantContext as TenantContextDecorator } from "../../../../common/decorators/tenant-context.decorator";
import { TenantContext } from "../../../../platform/tenancy/tenant.guard";
import {
  CreateGradingScaleSchema,
  UpdateGradingScaleSchema,
  CreateGradingScaleDto,
  UpdateGradingScaleDto,
  GradingScaleStatus,
  EDUCATION_GRADING_SCALES_PERMISSIONS,
} from "@sitehookz/education";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";

@Controller("education/grading-scales")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class GradingScalesController {
  constructor(private readonly gradingScalesService: GradingScalesService) {}

  @Post()
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.MANAGE)
  async create(
    @TenantContextDecorator() ctx: TenantContext,
    @Body(new ZodValidationPipe(CreateGradingScaleSchema))
    dto: CreateGradingScaleDto,
  ) {
    return this.gradingScalesService.create(ctx, dto);
  }

  @Get()
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.READ)
  async findAll(
    @TenantContextDecorator() ctx: TenantContext,
    @Query("status") status?: GradingScaleStatus,
  ) {
    return this.gradingScalesService.findAll(ctx, status);
  }

  @Get(":id")
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.READ)
  async findById(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.gradingScalesService.findById(ctx, id);
  }

  @Patch(":id")
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.MANAGE)
  async update(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateGradingScaleSchema))
    dto: UpdateGradingScaleDto,
  ) {
    return this.gradingScalesService.update(ctx, id, dto);
  }

  @Post(":id/activate")
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.MANAGE)
  async activate(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.gradingScalesService.activate(ctx, id);
  }

  @Post(":id/archive")
  @RequirePermission(EDUCATION_GRADING_SCALES_PERMISSIONS.MANAGE)
  async archive(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.gradingScalesService.archive(ctx, id);
  }
}
