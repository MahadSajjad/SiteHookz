import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { AssessmentsService } from "./assessments.service";
import { AssessmentResultsService } from "./assessment-results.service";
import { RequirePermission } from "../../../common/decorators/require-permission.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../../platform/authorization/permission.guard";
import { TenantContext as TenantContextDecorator } from "../../../common/decorators/tenant-context.decorator";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  BulkAssessmentResultsSchema,
} from "@sitehookz/education";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  EDUCATION_ASSESSMENTS_PERMISSIONS,
  EDUCATION_ASSESSMENT_RESULTS_PERMISSIONS,
} from "@sitehookz/education";

@Controller("education")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
    private readonly resultsService: AssessmentResultsService,
  ) {}

  @Post("subject-offerings/:id/assessments")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.CREATE)
  async createAssessment(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(CreateAssessmentSchema)) dto: any,
  ) {
    return this.assessmentsService.create(ctx, {
      ...dto,
      subjectOfferingId: id,
    });
  }

  @Get("subject-offerings/:id/assessments")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.READ)
  async getBySubjectOffering(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.findBySubjectOffering(ctx, id);
  }

  @Get("sections/:id/assessments")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.READ)
  async getBySection(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.findBySection(ctx, id);
  }

  @Get("batches/:id/assessments")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.READ)
  async getByBatch(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.findByBatch(ctx, id);
  }

  @Get("assessments/:id")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.READ)
  async getAssessment(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.findById(ctx, id);
  }

  @Patch("assessments/:id")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.UPDATE)
  async updateAssessment(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateAssessmentSchema)) dto: any,
  ) {
    return this.assessmentsService.update(ctx, id, dto);
  }

  @Post("assessments/:id/activate")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.ACTIVATE)
  async activateAssessment(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.activate(ctx, id);
  }

  @Post("assessments/:id/archive")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.ARCHIVE)
  async archiveAssessment(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.assessmentsService.archive(ctx, id);
  }

  @Get("assessments/:id/roster")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.READ)
  async getRoster(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.resultsService.getRoster(ctx, id);
  }

  @Put("assessments/:id/results")
  @RequirePermission(EDUCATION_ASSESSMENT_RESULTS_PERMISSIONS.GRADE)
  async bulkGrade(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(BulkAssessmentResultsSchema)) dto: any,
  ) {
    await this.resultsService.bulkGrade(ctx, id, dto);
    return { success: true };
  }

  @Post("assessments/:id/publish-results")
  @RequirePermission(EDUCATION_ASSESSMENTS_PERMISSIONS.PUBLISH_RESULTS)
  async publishResults(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    await this.resultsService.publishResults(ctx, id);
    return { success: true };
  }

  @Get("students/:id/assessment-results")
  @RequirePermission(EDUCATION_ASSESSMENT_RESULTS_PERMISSIONS.READ)
  async getStudentHistory(
    @TenantContextDecorator() ctx: TenantContext,
    @Param("id") id: string,
  ) {
    return this.resultsService.studentHistory(ctx, id);
  }
}
