import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { TeachingAssignmentsService } from "./teaching-assignments.service";
import { AssignTeacherDto, EndTeachingAssignmentDto } from "@sitehookz/education";
import { RequireAuth } from "../../../core/auth/decorators/require-auth.decorator";
import { GetTenant } from "../../../core/auth/decorators/get-tenant.decorator";
import { TenantContext } from "../../../core/auth/tenant-context";

@Controller("education/teaching-assignments")
@RequireAuth()
export class TeachingAssignmentsController {
  constructor(private readonly teachingAssignmentsService: TeachingAssignmentsService) {}

  @Post()
  assign(
    @GetTenant() tenant: TenantContext,
    @Body() assignTeacherDto: AssignTeacherDto
  ) {
    return this.teachingAssignmentsService.assign(tenant, assignTeacherDto);
  }

  @Get("offering/:subjectOfferingId")
  findBySubjectOfferingId(
    @GetTenant() tenant: TenantContext,
    @Param("subjectOfferingId") subjectOfferingId: string
  ) {
    return this.teachingAssignmentsService.findBySubjectOfferingId(tenant, subjectOfferingId);
  }

  @Get("staff/:staffMemberId")
  findByStaffMemberId(
    @GetTenant() tenant: TenantContext,
    @Param("staffMemberId") staffMemberId: string
  ) {
    return this.teachingAssignmentsService.findByStaffMemberId(tenant, staffMemberId);
  }

  @Post(":id/end")
  endAssignment(
    @GetTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() endDto: EndTeachingAssignmentDto
  ) {
    return this.teachingAssignmentsService.endAssignment(tenant, id, endDto);
  }
}
