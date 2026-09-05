import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ReportCardsService } from "./report-cards.service";
import { RequirePermission } from "../../../../common/decorators/require-permission.decorator";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../../../platform/authorization/permission.guard";
import { TenantContext as TenantContextDecorator } from "../../../../common/decorators/tenant-context.decorator";
import { TenantContext } from "../../../../platform/tenancy/tenant.guard";
import {
  GenerateReportCardsSchema,
  PublishReportCardsSchema,
  GenerateReportCardsDto,
  PublishReportCardsDto,
  ReportCardStatus,
  EDUCATION_REPORT_CARDS_PERMISSIONS,
} from "@sitehookz/education";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";

@Controller("education/report-cards")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ReportCardsController {
  constructor(private readonly reportCardsService: ReportCardsService) {}

  @Post("generate")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.GENERATE)
  async generate(
    @TenantContextDecorator() ctx: TenantContext,
    @Body(new ZodValidationPipe(GenerateReportCardsSchema))
    dto: GenerateReportCardsDto,
  ) {
    return this.reportCardsService.generate(ctx, dto);
  }

  @Post("publish")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.PUBLISH)
  async publish(
    @TenantContextDecorator() ctx: TenantContext,
    @Body(new ZodValidationPipe(PublishReportCardsSchema))
    dto: PublishReportCardsDto,
  ) {
    return this.reportCardsService.publish(ctx, dto);
  }

  @Get("sections/:sectionId")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.READ)
  async findBySection(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("sectionId") sectionId: string,
    @Query("status") status?: ReportCardStatus,
  ) {
    return this.reportCardsService.findBySection(ctx, sectionId, status);
  }

  @Get("batches/:batchId")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.READ)
  async findByBatch(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("batchId") batchId: string,
    @Query("status") status?: ReportCardStatus,
  ) {
    return this.reportCardsService.findByBatch(ctx, batchId, status);
  }

  @Get("students/:studentId")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.READ)
  async findByStudent(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("studentId") studentId: string,
  ) {
    return this.reportCardsService.findByStudent(ctx, studentId);
  }

  @Get(":id")
  @RequirePermission(EDUCATION_REPORT_CARDS_PERMISSIONS.READ)
  async findById(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.reportCardsService.findById(ctx, id);
  }
}
