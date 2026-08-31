import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { StudentFinancialSummaryService } from './student-financial-summary.service';
import { RequirePermission } from '../../../../platform/auth/decorators/require-permission.decorator';
import { CurrentTenant, TenantContext } from '../../../../platform/auth/decorators/current-tenant.decorator';

@Controller('education/students/:studentId/financial-summary')
export class StudentFinancialSummaryController {
  constructor(private readonly summaryService: StudentFinancialSummaryService) {}

  @Get()
  @RequirePermission('education.financial_summary.read')
  async getSummary(
    @CurrentTenant() tenant: TenantContext,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    const data = await this.summaryService.getSummary(tenant.organizationId, studentId);
    return { data };
  }
}
