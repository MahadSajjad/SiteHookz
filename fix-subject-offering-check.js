const fs = require('fs');
let file = 'apps/api/src/products/education/subject-offerings/subject-offerings.service.ts';
let code = fs.readFileSync(file, 'utf8');

// We need to add a check for the subject being active
let getSubjectActiveStr = `  private async validateSubjectActive(subjectId: string): Promise<void> {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException("Subject not found");
    if (subject.archivedAt !== null) {
      throw new BusinessException("SUBJECT_ARCHIVED", 400, "Cannot create an offering for an archived subject.");
    }
  }

  async createSchoolOffering(
    tenant: TenantContext,
    data: CreateSchoolSubjectOfferingDto,
  ) {
    await this.validateSubjectActive(data.subjectId);
    const branchId = await this.getBranchIdForSection(data.sectionId);`;

code = code.replace(`  async createSchoolOffering(
    tenant: TenantContext,
    data: CreateSchoolSubjectOfferingDto,
  ) {
    const branchId = await this.getBranchIdForSection(data.sectionId);`, getSubjectActiveStr);

let tuitionOfferingStr = `  async createTuitionOffering(
    tenant: TenantContext,
    data: CreateTuitionSubjectOfferingDto,
  ) {
    await this.validateSubjectActive(data.subjectId);
    const branchId = await this.getBranchIdForBatch(data.batchId);`;

code = code.replace(`  async createTuitionOffering(
    tenant: TenantContext,
    data: CreateTuitionSubjectOfferingDto,
  ) {
    const branchId = await this.getBranchIdForBatch(data.batchId);`, tuitionOfferingStr);

fs.writeFileSync(file, code);
