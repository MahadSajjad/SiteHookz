const fs = require("fs");

let service = fs.readFileSync(
  "apps/api/src/products/education/students/students.service.ts",
  "utf8",
);

service = service.replace(
  /admission number generation[\s\S]*?status:\s*dto\.status,\n\s*}\n\s*}\);\n\s*}\);/g,
  `
      // admission number generation safely within tx
      // We assume branchId is stable. If null, we use a placeholder branchId 'MAIN' or just use organizationId as branchId for the sequence
      const seqBranchId = dto.admissionBranchId || '00000000-0000-0000-0000-000000000000';
      const prefix = dto.admissionBranchId ? 'B' + dto.admissionBranchId.substring(0, 4).toUpperCase() : 'MAIN';

      const seq = await tx.studentAdmissionSequence.upsert({
        where: { organizationId_branchId: { organizationId: tenant.organizationId, branchId: seqBranchId } },
        update: { nextValue: { increment: 1 } },
        create: { organizationId: tenant.organizationId, branchId: seqBranchId, prefix, nextValue: 2 },
      });

      const admissionNumber = \`\${prefix}-\${String(seq.nextValue - 1).padStart(6, '0')}\`;

      return tx.student.create({
        data: {
          organizationId: tenant.organizationId,
          admissionNumber,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          phone: dto.phone,
          email: dto.email,
          admissionDate: dto.admissionDate,
          admissionBranchId: dto.admissionBranchId,
          status: dto.status,
        }
      });
    });
`,
);

fs.writeFileSync(
  "apps/api/src/products/education/students/students.service.ts",
  service,
  "utf8",
);
