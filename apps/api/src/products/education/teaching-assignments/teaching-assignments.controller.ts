import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { TeachingAssignmentsService } from "./teaching-assignments.service";
import {
  AssignTeacherDto,
  EndTeachingAssignmentDto,
} from "@sitehookz/education";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

@Controller("education/teaching-assignments")
export class TeachingAssignmentsController {
  constructor(
    private readonly teachingAssignmentsService: TeachingAssignmentsService,
  ) {}

  @Post()
  assign(
    @CurrentTenant() tenant: TenantContext,
    @Body() assignTeacherDto: AssignTeacherDto,
  ) {
    return this.teachingAssignmentsService.assign(tenant, assignTeacherDto);
  }

  @Get("offering/:subjectOfferingId")
  findBySubjectOfferingId(
    @CurrentTenant() tenant: TenantContext,
    @Param("subjectOfferingId") subjectOfferingId: string,
  ) {
    return this.teachingAssignmentsService.findBySubjectOfferingId(
      tenant,
      subjectOfferingId,
    );
  }

  @Get("staff/:staffMemberId")
  findByStaffMemberId(
    @CurrentTenant() tenant: TenantContext,
    @Param("staffMemberId") staffMemberId: string,
  ) {
    return this.teachingAssignmentsService.findByStaffMemberId(
      tenant,
      staffMemberId,
    );
  }

  @Post(":id/end")
  endAssignment(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() endDto: EndTeachingAssignmentDto,
  ) {
    return this.teachingAssignmentsService.endAssignment(tenant, id, endDto);
  }
}
