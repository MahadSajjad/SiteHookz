const fs = require('fs');
let file = 'apps/api/src/products/education/subjects/subjects.controller.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{ CreateSubjectDto, UpdateSubjectDto \} from "@sitehookz\/education";/, 'import { CreateSubjectDto, UpdateSubjectDto, createSubjectSchema, updateSubjectSchema } from "@sitehookz/education";\nimport { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";');
code = code.replace(/@Body\(\) createSubjectDto: CreateSubjectDto/g, '@Body(new ZodValidationPipe(createSubjectSchema)) createSubjectDto: CreateSubjectDto');
code = code.replace(/@Body\(\) updateSubjectDto: UpdateSubjectDto/g, '@Body(new ZodValidationPipe(updateSubjectSchema)) updateSubjectDto: UpdateSubjectDto');
fs.writeFileSync(file, code);
