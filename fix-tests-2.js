const fs = require('fs');

let testFile = 'apps/api/src/products/education/subject-offerings/subject-offerings.service.spec.ts';
let code = fs.readFileSync(testFile, 'utf8');

code = code.replace(/await expect\(service\.createSchoolOffering\(tenant, \{ subjectId: "s1", sectionId: "sec1" \}\)\)\n      \.rejects\.toThrow\(\);/g, `await expect(service.createSchoolOffering(tenant, { subjectId: "s1", sectionId: "sec1" }))
      .rejects.toThrow("Section not found");`);
// Fix prisma mock
code = code.replace(/section: \{ findFirst: jest\.fn\(\) \}/, 'section: { findUnique: jest.fn() }');
code = code.replace(/prisma\.section\.findFirst\.mockResolvedValue\(null\);/, 'prisma.section.findUnique.mockResolvedValue(null);');

fs.writeFileSync(testFile, code);
