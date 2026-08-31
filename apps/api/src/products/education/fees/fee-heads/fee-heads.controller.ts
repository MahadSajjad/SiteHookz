import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { FeeHeadsService } from './fee-heads.service';
import { CreateFeeHeadDto, UpdateFeeHeadDto, FeeHeadListResponse } from '@sitehookz/education';
import { RequirePermission } from '../../../../platform/auth/decorators/require-permission.decorator';
import { CurrentTenant, TenantContext } from '../../../../platform/auth/decorators/current-tenant.decorator';
import { ZodValidationPipe } from '../../../../platform/common/pipes/zod-validation.pipe';
import { CreateFeeHeadDtoSchema, UpdateFeeHeadDtoSchema } from '@sitehookz/education';

@Controller('education/fee-heads')
export class FeeHeadsController {
  constructor(private readonly feeHeadsService: FeeHeadsService) {}

  @Post()
  @RequirePermission('education.fee_heads.create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreateFeeHeadDtoSchema)) createDto: CreateFeeHeadDto,
  ) {
    const result = await this.feeHeadsService.create(tenant.organizationId, createDto);
    return { data: result };
  }

  @Get()
  @RequirePermission('education.fee_heads.read')
  async findAll(@CurrentTenant() tenant: TenantContext): Promise<FeeHeadListResponse> {
    const data = await this.feeHeadsService.findAll(tenant.organizationId);
    return { data, total: data.length };
  }

  @Get(':id')
  @RequirePermission('education.fee_heads.read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.feeHeadsService.findOne(tenant.organizationId, id);
    return { data: result };
  }

  @Patch(':id')
  @RequirePermission('education.fee_heads.update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateFeeHeadDtoSchema)) updateDto: UpdateFeeHeadDto,
  ) {
    const result = await this.feeHeadsService.update(tenant.organizationId, id, updateDto);
    return { data: result };
  }

  @Delete(':id')
  @RequirePermission('education.fee_heads.delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.feeHeadsService.remove(tenant.organizationId, id);
    return { success: true };
  }
}
