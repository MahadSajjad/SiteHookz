const fs = require('fs');
let file = 'apps/api/src/products/education/teaching-assignments/teaching-assignments.controller.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/import \{\n  AssignTeacherDto,\n  EndTeachingAssignmentDto,\n\} from "@sitehookz\/education";/, 'import {\n  AssignTeacherDto,\n  EndTeachingAssignmentDto,\n  assignTeacherSchema,\n  endTeachingAssignmentSchema\n} from "@sitehookz/education";\nimport { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";');
code = code.replace(/@Body\(\) assignTeacherDto: AssignTeacherDto/g, '@Body(new ZodValidationPipe(assignTeacherSchema)) assignTeacherDto: AssignTeacherDto');
code = code.replace(/@Body\(\) endDto: EndTeachingAssignmentDto/g, '@Body(new ZodValidationPipe(endTeachingAssignmentSchema)) endDto: EndTeachingAssignmentDto');
fs.writeFileSync(file, code);
