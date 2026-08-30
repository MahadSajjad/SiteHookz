const fs = require('fs');
let file = 'apps/api/src/products/education/subject-offerings/subject-offerings.controller.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{\n  CreateSchoolSubjectOfferingDto,\n  CreateTuitionSubjectOfferingDto,\n\} from "@sitehookz\/education";/, 'import {\n  CreateSchoolSubjectOfferingDto,\n  CreateTuitionSubjectOfferingDto,\n  createSchoolSubjectOfferingSchema,\n  createTuitionSubjectOfferingSchema\n} from "@sitehookz/education";\nimport { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";');
code = code.replace(/@Body\(\) createDto: CreateSchoolSubjectOfferingDto/g, '@Body(new ZodValidationPipe(createSchoolSubjectOfferingSchema)) createDto: CreateSchoolSubjectOfferingDto');
code = code.replace(/@Body\(\) createDto: CreateTuitionSubjectOfferingDto/g, '@Body(new ZodValidationPipe(createTuitionSubjectOfferingSchema)) createDto: CreateTuitionSubjectOfferingDto');
fs.writeFileSync(file, code);
