const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages', 'database', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// The new models start with // LAYER 8: Report Cards & Academic Reports
const splitPoint = schema.indexOf('// LAYER 8: Report Cards & Academic Reports');
if (splitPoint === -1) {
  console.log('Could not find Layer 8 models');
  process.exit(1);
}

let existingSchema = schema.substring(0, splitPoint);
let layer8Schema = schema.substring(splitPoint);

// Replace "String" with "String @db.Uuid" for all id and foreign key fields in layer8Schema
// The fields are id, organizationId, academicSessionId, studentEnrollmentId, sectionId, batchId, gradingScaleId, reportCardId, subjectId

layer8Schema = layer8Schema.replace(/id(\s+)String(\s+)@id @default\(uuid\(\)\)/g, 'id$1String$2@id @default(uuid()) @db.Uuid');
layer8Schema = layer8Schema.replace(/organizationId(\s+)String/g, 'organizationId$1String @db.Uuid');
layer8Schema = layer8Schema.replace(/academicSessionId(\s+)String/g, 'academicSessionId$1String @db.Uuid');
layer8Schema = layer8Schema.replace(/studentEnrollmentId(\s+)String/g, 'studentEnrollmentId$1String @db.Uuid');
layer8Schema = layer8Schema.replace(/sectionId(\s+)String\?/g, 'sectionId$1String? @db.Uuid');
layer8Schema = layer8Schema.replace(/batchId(\s+)String\?/g, 'batchId$1String? @db.Uuid');
layer8Schema = layer8Schema.replace(/gradingScaleId(\s+)String/g, 'gradingScaleId$1String @db.Uuid');
layer8Schema = layer8Schema.replace(/reportCardId(\s+)String/g, 'reportCardId$1String @db.Uuid');
layer8Schema = layer8Schema.replace(/subjectId(\s+)String/g, 'subjectId$1String @db.Uuid');

fs.writeFileSync(schemaPath, existingSchema + layer8Schema, 'utf8');
console.log('Schema patched for UUIDs.');
