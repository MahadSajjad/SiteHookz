const fs = require("fs");
const path = require("path");

// 1. Update enrollments.service.ts
const enrollmentsPath =
  "apps/api/src/products/education/enrollments/enrollments.service.ts";
let enrCode = fs.readFileSync(enrollmentsPath, "utf8");

enrCode = enrCode.replace(
  /async createTuitionEnrollment\([^{]+{/g,
  `async createTuitionEnrollment(tenant: TenantContext, studentId: string, dto: any) {
    if (tenant['institutionType' as any] === 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    
    return this.prisma.$transaction(async (tx) => {
       const batch = await tx.batch.findUnique({ where: { id: dto.batchId } });
       if (!batch || batch.organizationId !== tenant.organizationId) throw new NotFoundException('BATCH_NOT_FOUND');

       // 1 & 2. Lock the student
       const studentRows = await tx.$queryRaw\`SELECT id FROM "Student" WHERE id = \${studentId}::uuid AND "organizationId" = \${tenant.organizationId}::uuid FOR UPDATE\`;
       if (!Array.isArray(studentRows) || studentRows.length === 0) throw new NotFoundException('STUDENT_NOT_FOUND');

       // 3. Re-check active TUITION enrollment
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

       // 5 & 6. Create enrollment and placement
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
`,
);

// Also update School Enrollment to lock student
enrCode = enrCode.replace(
  /async createSchoolEnrollment\([^{]+{/g,
  `async createSchoolEnrollment(tenant: TenantContext, studentId: string, dto: any) {
    if (tenant['institutionType' as any] !== 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    
    return this.prisma.$transaction(async (tx) => {
       const section = await tx.section.findUnique({ where: { id: dto.sectionId } });
       if (!section || section.organizationId !== tenant.organizationId) throw new NotFoundException('SECTION_NOT_FOUND');

       // Lock student
       const studentRows = await tx.$queryRaw\`SELECT id FROM "Student" WHERE id = \${studentId}::uuid AND "organizationId" = \${tenant.organizationId}::uuid FOR UPDATE\`;
       if (!Array.isArray(studentRows) || studentRows.length === 0) throw new NotFoundException('STUDENT_NOT_FOUND');

       // Check invariant
       const active = await tx.studentEnrollment.findFirst({
         where: { organizationId: tenant.organizationId, studentId, placementType: 'SCHOOL', status: 'ACTIVE' }
       });
       if (active) throw new BadRequestException('ENROLLMENT_ACTIVE_SCHOOL_CONFLICT');

       const enrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId,
           branchId: section.branchId,
           placementType: 'SCHOOL',
           status: dto.status || 'ACTIVE',
           startDate: new Date(dto.startDate)
         }
       });

       await tx.schoolEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: enrollment.id,
           sectionId: section.id,
           rollNumber: dto.rollNumber
         }
       });

       return enrollment;
    });
`,
);

// Fix transitions locking
enrCode = enrCode.replace(
  /async promote\([^{]+{/g,
  `async promote(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
       // Lock old enrollment to prevent concurrent transitions
       const lockedRows = await tx.$queryRaw\`SELECT id, "studentId" FROM "StudentEnrollment" WHERE id = \${id}::uuid AND "organizationId" = \${tenant.organizationId}::uuid FOR UPDATE\`;
       if (!Array.isArray(lockedRows) || lockedRows.length === 0) throw new NotFoundException();
       
       const oldEnrollment = await tx.studentEnrollment.findUnique({ where: { id, organizationId: tenant.organizationId }});
       if (!oldEnrollment || oldEnrollment.status !== 'ACTIVE') throw new BadRequestException('ENROLLMENT_NOT_ACTIVE');

       // end old
       await tx.studentEnrollment.update({
         where: { id },
         data: { status: 'COMPLETED', endDate: new Date(), endReason: 'PROMOTED' }
       });

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
`,
);

enrCode = enrCode.replace(
  /async transfer\([^{]+{/g,
  `async transfer(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.$transaction(async (tx) => {
       const lockedRows = await tx.$queryRaw\`SELECT id, "studentId" FROM "StudentEnrollment" WHERE id = \${id}::uuid AND "organizationId" = \${tenant.organizationId}::uuid FOR UPDATE\`;
       if (!Array.isArray(lockedRows) || lockedRows.length === 0) throw new NotFoundException();
       
       const oldEnrollment = await tx.studentEnrollment.findUnique({ where: { id, organizationId: tenant.organizationId }});
       if (!oldEnrollment || oldEnrollment.status !== 'ACTIVE') throw new BadRequestException('ENROLLMENT_NOT_ACTIVE');

       // end old
       await tx.studentEnrollment.update({
         where: { id },
         data: { status: 'COMPLETED', endDate: new Date(), endReason: 'TRANSFERRED' }
       });

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
`,
);

fs.writeFileSync(
  enrollmentsPath,
  enrCode.replace(/async createSchoolEnrollment\([^{]+{/, ""),
  "utf8",
); // remove dup
fs.writeFileSync(
  enrollmentsPath,
  enrCode.replace(/async createTuitionEnrollment\([^{]+{/, ""),
  "utf8",
); // remove dup
fs.writeFileSync(
  enrollmentsPath,
  enrCode.replace(/async promote\([^{]+{/, ""),
  "utf8",
); // remove dup
fs.writeFileSync(
  enrollmentsPath,
  enrCode.replace(/async transfer\([^{]+{/, ""),
  "utf8",
); // remove dup

fs.writeFileSync(enrollmentsPath, enrCode, "utf8");

// Update auth in students.service.ts
const studentsPath =
  "apps/api/src/products/education/students/students.service.ts";
let stuCode = fs.readFileSync(studentsPath, "utf8");
stuCode = stuCode.replace(
  /const activeEnr[^}]+}/g,
  `const accessibleBranchIds = this.auth.getAccessibleBranchIdsForPermission(tenant, 'education.students.read');
    if (!accessibleBranchIds.includes('*')) {
      const activeEnr = await this.prisma.studentEnrollment.findFirst({ 
        where: { organizationId: tenant.organizationId, studentId: id, status: 'ACTIVE', branchId: { in: accessibleBranchIds } }
      });
      if (!activeEnr) throw new NotFoundException('STUDENT_NOT_FOUND');
    }`,
);
fs.writeFileSync(studentsPath, stuCode, "utf8");

console.log("Fixed services");
