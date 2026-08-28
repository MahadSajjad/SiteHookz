const fs = require("fs");
const path = require("path");

const enrollmentsServicePath = path.join(
  "apps",
  "api",
  "src",
  "products",
  "education",
  "enrollments",
  "enrollments.service.ts",
);
let serviceCode = fs.readFileSync(enrollmentsServicePath, "utf8");

const tuitionFlows = `
  async createTuitionEnrollment(tenant: TenantContext, studentId: string, dto: any) {
    if (tenant['institutionType' as any] === 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    
    return this.prisma.$transaction(async (tx) => {
       const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
       if (!batch || batch.organizationId !== tenant.organizationId) throw new NotFoundException('BATCH_NOT_FOUND');

       // Check duplicate invariant safely inside transaction
       const existing = await tx.studentEnrollment.findFirst({
         where: { 
           organizationId: tenant.organizationId, 
           studentId, 
           placementType: 'TUITION', 
           status: 'ACTIVE',
           tuitionPlacement: { batchId: dto.batchId }
         }
       });
       if (existing) throw new BadRequestException('ENROLLMENT_DUPLICATE_BATCH');

       const enrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId,
           branchId: batch.branchId,
           placementType: 'TUITION',
           status: dto.status || 'ACTIVE',
           startDate: new Date(dto.startDate)
         }
       });

       await tx.tuitionEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: enrollment.id,
           batchId: batch.id
         }
       });

       return enrollment;
    });
  }

  async endEnrollment(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.studentEnrollment.update({
      where: { id, organizationId: tenant.organizationId },
      data: {
        status: dto.status || 'COMPLETED',
        endDate: new Date(dto.endDate),
        endReason: dto.endReason
      }
    });
  }

  async promote(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
       // end old
       await tx.studentEnrollment.update({
         where: { id, organizationId: tenant.organizationId },
         data: { status: 'COMPLETED', endDate: new Date(), endReason: 'PROMOTED' }
       });
       
       const oldEnrollment = await tx.studentEnrollment.findUnique({ where: { id, organizationId: tenant.organizationId }});
       if (!oldEnrollment) throw new NotFoundException();

       // verify section
       const section = await tx.section.findUnique({ where: { id: dto.targetSectionId } });
       if (!section || section.organizationId !== tenant.organizationId) throw new NotFoundException('SECTION_NOT_FOUND');

       const newEnrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId: oldEnrollment.studentId,
           branchId: section.branchId,
           placementType: 'SCHOOL',
           status: 'ACTIVE',
           startDate: new Date(dto.effectiveDate || new Date())
         }
       });

       await tx.schoolEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: newEnrollment.id,
           sectionId: section.id,
           rollNumber: dto.rollNumber
         }
       });
       return newEnrollment;
    });
  }

  async transfer(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
       // end old
       await tx.studentEnrollment.update({
         where: { id, organizationId: tenant.organizationId },
         data: { status: 'COMPLETED', endDate: new Date(), endReason: 'TRANSFERRED' }
       });
       
       const oldEnrollment = await tx.studentEnrollment.findUnique({ where: { id, organizationId: tenant.organizationId }});
       if (!oldEnrollment) throw new NotFoundException();

       // verify section
       const section = await tx.section.findUnique({ where: { id: dto.targetSectionId } });
       if (!section || section.organizationId !== tenant.organizationId) throw new NotFoundException('SECTION_NOT_FOUND');

       const newEnrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId: oldEnrollment.studentId,
           branchId: section.branchId,
           placementType: 'SCHOOL',
           status: 'ACTIVE',
           startDate: new Date(dto.effectiveDate || new Date())
         }
       });

       await tx.schoolEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: newEnrollment.id,
           sectionId: section.id,
           rollNumber: dto.rollNumber
         }
       });
       return newEnrollment;
    });
  }
  
  async changeSection(tenant: TenantContext, id: string, dto: any) {
    return this.transfer(tenant, id, dto);
  }

  async changeBatch(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
       // end old
       await tx.studentEnrollment.update({
         where: { id, organizationId: tenant.organizationId },
         data: { status: 'COMPLETED', endDate: new Date(), endReason: 'TRANSFERRED' }
       });
       
       const oldEnrollment = await tx.studentEnrollment.findUnique({ where: { id, organizationId: tenant.organizationId }});
       if (!oldEnrollment) throw new NotFoundException();

       const batch = await tx.batch.findUnique({ where: { id: dto.targetBatchId } });
       if (!batch || batch.organizationId !== tenant.organizationId) throw new NotFoundException('BATCH_NOT_FOUND');

       const newEnrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId: oldEnrollment.studentId,
           branchId: batch.branchId,
           placementType: 'TUITION',
           status: 'ACTIVE',
           startDate: new Date(dto.effectiveDate || new Date())
         }
       });

       await tx.tuitionEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: newEnrollment.id,
           batchId: batch.id
         }
       });
       return newEnrollment;
    });
  }
}
`;

serviceCode = serviceCode.replace(/}\n$/, tuitionFlows);
fs.writeFileSync(enrollmentsServicePath, serviceCode, "utf8");

const enrollmentsControllerPath = path.join(
  "apps",
  "api",
  "src",
  "products",
  "education",
  "enrollments",
  "enrollments.controller.ts",
);
let controllerCode = fs.readFileSync(enrollmentsControllerPath, "utf8");

const controllerFlows = `
  @Post('students/:studentId/enrollments/tuition')
  @RequirePermission('education.enrollments.create')
  async createTuitionEnrollment(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string, @Body() dto: any) {
    return this.service.createTuitionEnrollment(tenant, studentId, dto);
  }

  @Post('enrollments/:id/end')
  @RequirePermission('education.enrollments.end')
  async endEnrollment(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.endEnrollment(tenant, id, dto);
  }

  @Post('enrollments/:id/promote')
  @RequirePermission('education.enrollments.promote')
  async promote(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.promote(tenant, id, dto);
  }

  @Post('enrollments/:id/transfer')
  @RequirePermission('education.enrollments.transfer')
  async transfer(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.transfer(tenant, id, dto);
  }

  @Post('enrollments/:id/change-section')
  @RequirePermission('education.enrollments.transfer')
  async changeSection(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.changeSection(tenant, id, dto);
  }

  @Post('enrollments/:id/change-batch')
  @RequirePermission('education.enrollments.transfer')
  async changeBatch(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.changeBatch(tenant, id, dto);
  }
}
`;

controllerCode = controllerCode.replace(/}\n$/, controllerFlows);
fs.writeFileSync(enrollmentsControllerPath, controllerCode, "utf8");

console.log("Enrollments flows added.");
