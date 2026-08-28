import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { CreateBranchDto, createBranchSchema } from "./dto/create-branch.dto";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { TenantContext } from "../../common/decorators/tenant-context.decorator";
import { RequirePermission } from "../authorization/permission.guard";

@Controller("branches")
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @RequirePermission("platform.branches.create")
  @Post()
  async create(
    @TenantContext() tenant: any,
    @Body(new ZodValidationPipe(createBranchSchema)) dto: CreateBranchDto,
  ) {
    return this.branchesService.create(tenant.organizationId, dto);
  }

  @RequirePermission("platform.branches.read")
  @Get()
  async findAll(@TenantContext() tenant: any) {
    return this.branchesService.findAll(tenant.organizationId);
  }

  @RequirePermission("platform.branches.archive")
  @Post(":id/archive")
  async archive(@TenantContext() tenant: any, @Param("id") id: string) {
    await this.branchesService.archive(tenant.organizationId, id);
    return { success: true };
  }
}
